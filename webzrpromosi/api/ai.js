const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_CHAT_API_URL = "https://api.openai.com/v1/chat/completions";
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gpt-4.1-mini";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

function send(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function cleanText(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function safeJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

function extractChatOutputText(data) {
  return String(data.choices?.[0]?.message?.content || "").trim();
}

function extractGeminiOutputText(data) {
  const chunks = [];
  for (const candidate of data.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (typeof part.text === "string") chunks.push(part.text);
    }
  }
  return chunks.join("\n").trim();
}

function getErrorMessage(data, fallback = "AI provider error") {
  return cleanText(data?.error?.message || data?.message || fallback, 500);
}

function formatMoney(value) {
  const number = Number(value || 0);
  return `Rp${number.toLocaleString("id-ID")}`;
}

function normalizeMenuList(menus) {
  if (!Array.isArray(menus)) return [];
  return menus.slice(0, 40).map((menu) => ({
    name: cleanText(menu.name, 90),
    category: cleanText(menu.category, 60),
    price: Number(menu.price || 0),
    description: cleanText(menu.description, 220),
    stock: Number(menu.stock || 0),
    is_available: menu.is_available !== false
  }));
}

function buildPrompt(feature, body) {
  const menus = normalizeMenuList(body.menus || body.products);
  const menuContext = menus.length
    ? menus.map((menu) => {
        const stock = menu.stock > 0 ? `stok ${menu.stock}` : "stok belum diisi";
        const status = menu.is_available ? "tersedia" : "habis";
        return `- ${menu.name} (${menu.category || "menu"}): ${formatMoney(menu.price)}, ${status}, ${stock}. ${menu.description}`;
      }).join("\n")
    : "- Daftar menu belum tersedia dari database.";

  const base = `
Kamu adalah AE Assistant untuk ZR SmartOrder AI, platform digital UMKM Pondok Es Teller ZR Padang.
Jawab dalam Bahasa Indonesia yang ramah, singkat, jelas, dan cocok untuk pemilik/pelanggan UMKM kuliner.
Jangan mengarang harga, menu, stok, promo, alamat, atau data penjualan. Jika data tidak tersedia, katakan perlu dicek di dashboard/WhatsApp.
Menu dari database:
${menuContext}
`.trim();

  if (feature === "customer-assistant") {
    return `${base}

Tugas: jawab pertanyaan customer, beri rekomendasi dari menu tersedia, dan arahkan checkout jika ingin pesan.
Pertanyaan customer: ${cleanText(body.message || body.prompt, 900)}`;
  }

  if (feature === "caption-generator") {
    return `${base}

Tugas: buat materi promosi untuk admin.
Nama menu: ${cleanText(body.productName, 120)}
Harga: ${cleanText(body.price, 40)}
Deskripsi: ${cleanText(body.description, 400)}
Target promo: ${cleanText(body.target, 200)}

Output wajib:
1. Tiga caption Instagram/WhatsApp.
2. Lima hashtag lokal relevan.
3. Satu versi pendek untuk story.`;
  }

  if (feature === "product-description") {
    return `${base}

Tugas: buat deskripsi menu UMKM yang menarik, singkat, dan tidak berlebihan.
Nama produk: ${cleanText(body.productName, 120)}
Bahan/rasa: ${cleanText(body.ingredients, 400)}
Output maksimal 3 kalimat.`;
  }

  if (feature === "sales-insight") {
    const orders = Array.isArray(body.orders) ? body.orders.slice(0, 80) : [];
    const orderContext = orders.length
      ? orders.map((order) => {
          const items = Array.isArray(order.order_items)
            ? order.order_items.map((item) => `${item.product_name} x${item.qty}`).join(", ")
            : "";
          return `- ${order.created_at || ""} | ${order.status || "new"} | ${formatMoney(order.total_price)} | ${items}`;
        }).join("\n")
      : "- Belum ada order yang dikirim ke AI.";

    return `${base}

Tugas: bantu pemilik UMKM membaca laporan penjualan dengan menganalisis semua data order yang diberikan, bukan memakai template jawaban.
Data order:
${orderContext}

Output wajib:
- Ringkasan penjualan hari ini.
- Menu paling laris jika terlihat dari data.
- Saran stok.
- Saran promo besok.
- Narasi sederhana yang mudah dipahami pemilik UMKM.`;
  }

  return `${base}\n\nTugas: ${cleanText(body.prompt || body.message, 1000)}`;
}

function uniqueModels(primary) {
  return [...new Set([primary, DEFAULT_MODEL, "gpt-4o-mini", "gpt-4o"].filter(Boolean))];
}

function uniqueGeminiModels(primary) {
  return [...new Set([primary, DEFAULT_GEMINI_MODEL, "gemini-2.5-flash-lite", "gemini-2.0-flash"].filter(Boolean))];
}

async function callResponsesApi(apiKey, model, feature, prompt) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "developer",
          content: "Kamu membantu UMKM kuliner Indonesia. Analisis data yang diberikan, jaga jawaban faktual, jangan mengarang data, dan selalu pakai database/context yang diberikan."
        },
        { role: "user", content: prompt }
      ],
      max_output_tokens: feature === "sales-insight" ? 760 : 480
    })
  });
  const data = await response.json();
  if (!response.ok) {
    return { ok: false, status: response.status, message: getErrorMessage(data), data };
  }
  return { ok: true, result: extractOutputText(data), model: data.model || model };
}

async function callChatApi(apiKey, model, feature, prompt) {
  const response = await fetch(OPENAI_CHAT_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "Kamu membantu UMKM kuliner Indonesia. Analisis data yang diberikan, jaga jawaban faktual, jangan mengarang data, dan selalu pakai database/context yang diberikan."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: feature === "sales-insight" ? 760 : 480,
      temperature: 0.7
    })
  });
  const data = await response.json();
  if (!response.ok) {
    return { ok: false, status: response.status, message: getErrorMessage(data), data };
  }
  return { ok: true, result: extractChatOutputText(data), model: data.model || model };
}

async function callGeminiApi(apiKey, model, feature, prompt) {
  const response = await fetch(`${GEMINI_API_BASE_URL}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: "Kamu membantu UMKM kuliner Indonesia. Analisis data yang diberikan, jaga jawaban faktual, jangan mengarang data, dan selalu pakai database/context yang diberikan."
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: feature === "sales-insight" ? 760 : 480
      }
    })
  });
  const data = await response.json();
  if (!response.ok) {
    return { ok: false, status: response.status, message: getErrorMessage(data), data };
  }
  return { ok: true, result: extractGeminiOutputText(data), model, provider: "gemini" };
}

async function runAi(apiKey, feature, prompt) {
  const requestedModel = process.env.AI_MODEL || process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const models = uniqueModels(requestedModel);
  const errors = [];

  for (const model of models) {
    const responsesResult = await callResponsesApi(apiKey, model, feature, prompt);
    if (responsesResult.ok && responsesResult.result) return responsesResult;
    errors.push(`responses:${model}:${responsesResult.status || "no-status"}:${responsesResult.message || "empty output"}`);

    const chatResult = await callChatApi(apiKey, model, feature, prompt);
    if (chatResult.ok && chatResult.result) return chatResult;
    errors.push(`chat:${model}:${chatResult.status || "no-status"}:${chatResult.message || "empty output"}`);
  }

  return { ok: false, message: errors.slice(-2).join(" | "), errors };
}

async function runGemini(apiKey, feature, prompt) {
  const aiModel = cleanText(process.env.AI_MODEL, 80);
  const requestedModel = process.env.GEMINI_MODEL || (aiModel.startsWith("gemini") ? aiModel : DEFAULT_GEMINI_MODEL);
  const models = uniqueGeminiModels(requestedModel);
  const errors = [];

  for (const model of models) {
    const result = await callGeminiApi(apiKey, model, feature, prompt);
    if (result.ok && result.result) return result;
    errors.push(`gemini:${model}:${result.status || "no-status"}:${result.message || "empty output"}`);
  }

  return { ok: false, message: errors.slice(-2).join(" | "), errors };
}

async function runConfiguredAi(feature, prompt) {
  const provider = cleanText(process.env.AI_PROVIDER, 40).toLowerCase();
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  const errors = [];

  if (geminiKey && (provider === "gemini" || !openAiKey)) {
    const geminiResult = await runGemini(geminiKey, feature, prompt);
    if (geminiResult.ok) return geminiResult;
    errors.push(...(geminiResult.errors || [geminiResult.message]));
  }

  if (openAiKey) {
    const openAiResult = await runAi(openAiKey, feature, prompt);
    if (openAiResult.ok) return { ...openAiResult, provider: "openai" };
    errors.push(...(openAiResult.errors || [openAiResult.message]));
  }

  if (geminiKey && provider !== "gemini") {
    const geminiResult = await runGemini(geminiKey, feature, prompt);
    if (geminiResult.ok) return geminiResult;
    errors.push(...(geminiResult.errors || [geminiResult.message]));
  }

  return { ok: false, message: errors.slice(-2).join(" | "), errors };
}

async function logToSupabase(feature, prompt, result, userId) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  try {
    await fetch(`${url}/rest/v1/ai_logs`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        user_id: userId || null,
        feature,
        prompt: prompt.slice(0, 4000),
        result: result.slice(0, 4000)
      })
    });
  } catch (error) {
    console.error("AI log failed:", error);
  }
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    send(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!process.env.GEMINI_API_KEY && !process.env.AI_API_KEY && !process.env.OPENAI_API_KEY) {
    send(res, 503, { error: "AI belum aktif. Set GEMINI_API_KEY atau OPENAI_API_KEY di Vercel Environment Variables." });
    return;
  }

  const body = safeJson(req.body, null);
  if (!body) {
    send(res, 400, { error: "Body JSON tidak valid." });
    return;
  }

  const feature = cleanText(body.feature || "customer-assistant", 80);
  const prompt = buildPrompt(feature, body);

  try {
    const aiResult = await runConfiguredAi(feature, prompt);
    if (!aiResult.ok) {
      console.error("AI provider error:", aiResult.errors || aiResult.message);
      send(res, 502, {
        error: "AI server belum berhasil memproses data.",
        detail: aiResult.message || "Cek GEMINI_API_KEY/OPENAI_API_KEY, nama model, dan environment Production di Vercel."
      });
      return;
    }

    const result = aiResult.result || "AI belum menghasilkan jawaban. Coba ulangi dengan input lebih jelas.";
    await logToSupabase(feature, prompt, result, cleanText(body.userId, 80));
    send(res, 200, { result, feature, model: aiResult.model, provider: aiResult.provider || "openai" });
  } catch (error) {
    console.error("AI endpoint error:", error);
    send(res, 500, { error: "Server AI belum bisa memproses permintaan.", detail: cleanText(error.message, 300) });
  }
};
