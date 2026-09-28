const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (!req.body) return {};
  try {
    return JSON.parse(req.body);
  } catch {
    return null;
  }
}

function cleanMenu(menu) {
  return {
    name: String(menu.name || "").slice(0, 80),
    price: Number(menu.price || 0),
    description: String(menu.description || "").slice(0, 180),
    status: String(menu.status || "Tersedia").slice(0, 40),
    category: String(menu.category || "").slice(0, 40),
    rating: String(menu.rating || "").slice(0, 12)
  };
}

function buildMenuContext(menus) {
  if (!menus.length) {
    return "- Menu belum berhasil dimuat. Arahkan pengunjung melihat menu di halaman atau WhatsApp.";
  }
  return menus.map((menu) => {
    const price = menu.price ? `Rp${menu.price.toLocaleString("id-ID")}` : "harga belum tersedia";
    return `- ${menu.name}: ${price}, status ${menu.status}, kategori ${menu.category || "menu"}, rating ${menu.rating || "-"}. ${menu.description}`;
  }).join("\n");
}

function buildSystemPrompt(menuContext) {
  return `Kamu adalah AE, asisten virtual resmi untuk website Pondok Es Teller ZR / Esteller ZR di Kalumbuk, Kota Padang.
Gaya AE: ramah, futuristik, sopan, singkat, segar, dan khas brand Esteller ZR.
Tugas utama: bantu pengunjung soal menu, harga, lokasi, jam buka, promo, delivery, cara pesan, dan rekomendasi minuman.

Data bisnis:
- Nama brand: Pondok Es Teller ZR / Esteller ZR
- Lokasi: Jl. Kalumbuk No21, Kota Padang, Sumatera Barat
- Jam buka: setiap hari 10.00 - 22.00 WIB
- WhatsApp utama: 0813-7411-0444
- WhatsApp kedua: 0813-6348-9111
- Delivery: area Kalumbuk, Kuranji, Siteba, dan area Padang terdekat. Ongkir dikonfirmasi sesuai jarak.
- Pembayaran: cash, transfer, QRIS jika tersedia saat konfirmasi.

Menu saat ini:
${menuContext}

Aturan jawaban:
- Jawab dalam Bahasa Indonesia.
- Maksimal 4 kalimat pendek kecuali pengguna minta daftar menu.
- Jangan mengarang promo, stok, atau ongkir pasti. Jika belum pasti, arahkan untuk konfirmasi via WhatsApp.
- Jika pengguna ingin pesan, arahkan ke form pesanan atau WhatsApp.
- Jangan membahas API key, sistem internal, atau detail teknis backend.`.trim();
}

// OpenAI handler
async function callOpenAI(apiKey, message, history, menuContext) {
  const developerPrompt = buildSystemPrompt(menuContext);
  const input = [
    { role: "developer", content: developerPrompt },
    ...history,
    { role: "user", content: message }
  ];

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      input,
      max_output_tokens: 260
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("OpenAI API error:", data);
    throw new Error("OpenAI upstream error");
  }

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return { reply: data.output_text.trim(), model: data.model || "openai" };
  }
  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") chunks.push(content.text);
    }
  }
  return { reply: chunks.join("\n").trim(), model: data.model || "openai" };
}

// Gemini handler
async function callGemini(apiKey, message, history, menuContext) {
  const systemPrompt = buildSystemPrompt(menuContext);

  const contents = [];
  for (const item of history) {
    contents.push({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: String(item.content || "").slice(0, 500) }]
    });
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  const url = `${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        maxOutputTokens: 260,
        temperature: 0.7
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Gemini API error:", data);
    throw new Error("Gemini upstream error");
  }

  const text = data && data.candidates && data.candidates[0] &&
    data.candidates[0].content && data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text
    ? data.candidates[0].content.parts[0].text : "";
  return { reply: text.trim(), model: "gemini-2.0-flash" };
}

// Main Vercel handler
module.exports = async function handler(req, res) {
  const method = req.method || "GET";

  if (method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openaiKey && !geminiKey) {
    res.status(503).json({
      error: "AE belum aktif. Silakan setel OPENAI_API_KEY atau GEMINI_API_KEY di environment Vercel."
    });
    return;
  }

  const body = parseBody(req);
  if (!body) {
    res.status(400).json({ error: "Request body tidak valid." });
    return;
  }

  const message = String(body.message || "").trim().slice(0, 700);
  if (!message) {
    res.status(400).json({ error: "Pesan tidak boleh kosong." });
    return;
  }

  const menus = Array.isArray(body.menus) ? body.menus.slice(0, 24).map(cleanMenu) : [];
  const history = Array.isArray(body.history)
    ? body.history.slice(-8).map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: String(item.content || "").slice(0, 500)
      }))
    : [];

  const menuContext = buildMenuContext(menus);

  try {
    let result;
    if (openaiKey) {
      result = await callOpenAI(openaiKey, message, history, menuContext);
    } else {
      result = await callGemini(geminiKey, message, history, menuContext);
    }

    res.status(200).json({
      reply: result.reply || "AE belum menemukan jawaban yang pas. Coba tanya dengan kalimat lain ya.",
      model: result.model
    });
  } catch (error) {
    console.error("AE chat error:", error);

    // If OpenAI failed and Gemini key is available, try as fallback
    if (openaiKey && geminiKey) {
      try {
        console.log("Trying Gemini as fallback...");
        const result = await callGemini(geminiKey, message, history, menuContext);
        res.status(200).json({
          reply: result.reply || "AE belum menemukan jawaban yang pas. Coba tanya dengan kalimat lain ya.",
          model: result.model
        });
        return;
      } catch (fallbackError) {
        console.error("Gemini fallback also failed:", fallbackError);
      }
    }

    res.status(500).json({ error: "AE belum bisa tersambung. Coba lagi sebentar ya." });
  }
};
