// ==========================================
// SMART AI CHATBOT - PONDOK ES TELLER ZR
// Version: 2.0 - Enhanced Intelligence
// ==========================================

/**
 * Advanced AI Chatbot dengan kemampuan:
 * - 50+ pertanyaan yang bisa dijawab
 * - Fuzzy matching untuk variasi pertanyaan
 * - Context-aware responses
 * - Personality yang ramah dan natural
 * - Fallback responses yang helpful
 */

class SmartChatbot {
    constructor(menuData) {
        this.menuData = menuData || [];
        this.conversationHistory = [];
        this.userName = null;
        
        // Knowledge base - Database pertanyaan dan jawaban
        this.knowledgeBase = this.initializeKnowledgeBase();
    }

    initializeKnowledgeBase() {
        return {
            // ==========================================
            // GREETING & BASIC CONVERSATION
            // ==========================================
            greeting: {
                keywords: ['halo', 'hai', 'hi', 'hello', 'hei', 'hey', 'assalamualaikum', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam', 'permisi', 'salam'],
                responses: [
                    "Halo! Selamat datang di Pondok Es Teller ZR! 😊 Ada yang bisa saya bantu?",
                    "Hai! Senang bisa bantu kamu hari ini. Mau tanya apa tentang Es Teller ZR?",
                    "Halo! Lagi cari es teller segar? Kamu datang ke tempat yang tepat! 🍧",
                    "Hai! Saya asisten virtual Es Teller ZR. Siap membantu kamu! 🤖"
                ],
                type: 'random'
            },

            thanks: {
                keywords: ['terima kasih', 'makasih', 'thanks', 'thank you', 'tengkyu', 'thx', 'tq'],
                responses: [
                    "Sama-sama! Jangan lupa pesan Es Teller ZR ya. Dijamin segar! 🧊",
                    "Senang bisa membantu! Kapan-kapan mampir ya ke toko kami! 😊",
                    "Sama-sama! Kalau ada pertanyaan lagi, jangan sungkan tanya ya! 💚",
                    "You're welcome! Semoga hari kamu menyenangkan! ☀️"
                ],
                type: 'random'
            },

            goodbye: {
                keywords: ['bye', 'dadah', 'sampai jumpa', 'selamat tinggal', 'pamit', 'dulu ya'],
                responses: [
                    "Sampai jumpa! Jangan lupa mampir ke Pondok Es Teller ZR ya! 👋",
                    "Bye bye! Semoga harimu menyenangkan! 😊",
                    "Dadah! Kapan-kapan pesan lagi ya! 🍧",
                    "Sampai ketemu lagi! Stay fresh! 🧊"
                ],
                type: 'random'
            },

            // ==========================================
            // MENU & HARGA
            // ==========================================
            menuList: {
                keywords: ['menu', 'ada apa', 'jual apa', 'menu apa', 'pilihan', 'varian', 'macam'],
                response: (bot) => {
                    const menuList = bot.menuData
                        .filter(m => m.status !== 'Habis')
                        .map(m => `• ${m.name} - ${bot.formatPrice(m.price)} (⭐ ${m.rating})`)
                        .join('\n');
                    return `Menu kami yang tersedia:\n\n${menuList}\n\nMau pesan yang mana? Atau mau saya rekomendasikan? 😊`;
                },
                type: 'function'
            },

            price: {
                keywords: ['harga', 'berapa', 'biaya', 'tarif', 'ongkos', 'mahal', 'murah'],
                response: (bot) => {
                    const cheapest = bot.menuData.filter(m => m.status !== 'Habis').sort((a, b) => a.price - b.price)[0];
                    const mostExpensive = bot.menuData.filter(m => m.status !== 'Habis').sort((a, b) => b.price - a.price)[0];
                    
                    if (cheapest && mostExpensive) {
                        return `Harga menu kami mulai dari ${bot.formatPrice(cheapest.price)} (${cheapest.name}) sampai ${bot.formatPrice(mostExpensive.price)} (${mostExpensive.name}). Mau lihat menu lengkap? 💰`;
                    }
                    return "Harga menu kami bervariasi mulai dari Rp12.000 - Rp55.000. Mau lihat menu lengkap? 💰";
                },
                type: 'function'
            },

            recommendation: {
                keywords: ['rekomendasi', 'rekomen', 'saran', 'enak', 'favorit', 'best', 'terbaik', 'paling', 'populer', 'laris'],
                response: (bot) => {
                    const topRated = bot.menuData
                        .filter(m => m.status !== 'Habis')
                        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))[0];
                    
                    if (topRated) {
                        return `Rekomendasi saya: ${topRated.name}! 🌟\n\nRating: ${topRated.rating} ⭐\nHarga: ${bot.formatPrice(topRated.price)}\n\n${topRated.description}\n\nMau pesan ini? Atau mau lihat menu lain?`;
                    }
                    return "Es Teller Alpukat Spesial adalah favorit pelanggan! Alpukatnya melimpah dan creamy banget. Rating 4.9 ⭐ Mau coba? 🥑";
                },
                type: 'function'
            },

            cheapest: {
                keywords: ['termurah', 'paling murah', 'yang murah', 'hemat', 'budget'],
                response: (bot) => {
                    const cheapest = bot.menuData.filter(m => m.status !== 'Habis').sort((a, b) => a.price - b.price)[0];
                    if (cheapest) {
                        return `Menu termurah kami: ${cheapest.name} - ${bot.formatPrice(cheapest.price)} 💚\n\n${cheapest.description}\n\nTetap segar dan enak kok! Mau pesan?`;
                    }
                    return "Menu termurah kami Es Teller Original cuma Rp12.000! Tetap segar dan enak kok! 💚";
                },
                type: 'function'
            },

            // ==========================================
            // JAM OPERASIONAL
            // ==========================================
            openingHours: {
                keywords: ['jam', 'buka', 'tutup', 'kapan', 'operasional', 'libur', 'minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'],
                response: () => {
                    const now = new Date();
                    const hour = now.getHours();
                    const isOpen = hour >= 10 && hour < 22;
                    
                    if (isOpen) {
                        return `Kami buka setiap hari jam 10.00 - 22.00 WIB 🕙\n\nSekarang kami BUKA! Mampir langsung atau pesan via WhatsApp ya! 😊`;
                    } else {
                        return `Kami buka setiap hari jam 10.00 - 22.00 WIB 🕙\n\nMaaf, sekarang kami TUTUP. Tapi kamu bisa pesan dulu via WhatsApp untuk besok! 📱`;
                    }
                },
                type: 'function'
            },

            // ==========================================
            // LOKASI & ALAMAT
            // ==========================================
            location: {
                keywords: ['lokasi', 'alamat', 'dimana', 'di mana', 'tempat', 'posisi', 'maps', 'google maps', 'arah', 'jalan'],
                responses: [
                    "Kami ada di Jl. Kalumbuk No21, Kota Padang 📍\n\nKlik menu 'Lokasi' di atas untuk buka Google Maps dan lihat rute lengkapnya ya!",
                    "Alamat kami: Jl. Kalumbuk No21, Kota Padang 🗺️\n\nGampang kok dicari! Klik menu 'Lokasi' untuk petunjuk arah via Google Maps!",
                    "Pondok Es Teller ZR ada di Jl. Kalumbuk No21, Padang 📌\n\nMau lihat di peta? Scroll ke bawah ke bagian 'Lokasi' ya!"
                ],
                type: 'random'
            },

            distance: {
                keywords: ['jauh', 'dekat', 'jarak', 'berapa km', 'berapa meter'],
                responses: [
                    "Untuk tahu jarak dari lokasi kamu, bisa buka Google Maps di menu 'Lokasi' ya! Nanti akan muncul estimasi jarak dan waktu tempuh 🚗",
                    "Jarak tergantung dari mana kamu berangkat. Coba cek di Google Maps (menu 'Lokasi') untuk estimasi yang akurat! 📍"
                ],
                type: 'random'
            },

            // ==========================================
            // DELIVERY & PENGIRIMAN
            // ==========================================
            delivery: {
                keywords: ['delivery', 'antar', 'kirim', 'diantar', 'dikirim', 'pesan antar', 'gojek', 'grab'],
                responses: [
                    "Bisa delivery! 📦\n\nOngkir menyesuaikan jarak (via Gojek/Grab). Estimasi waktu persiapan 15-30 menit. Pesan via WhatsApp ya!",
                    "Kami melayani delivery! 🛵\n\nKamu bisa pesan via Gojek/Grab atau langsung via WhatsApp kami. Ongkir sesuai jarak ya!",
                    "Delivery ready! 🚀\n\nEstimasi persiapan 15-30 menit. Ongkir tergantung jarak (pakai Gojek/Grab). Yuk pesan sekarang!"
                ],
                type: 'random'
            },

            ongkir: {
                keywords: ['ongkir', 'ongkos kirim', 'biaya kirim', 'biaya antar'],
                responses: [
                    "Ongkir menyesuaikan jarak kamu dari toko kami ya! Biasanya pakai tarif Gojek/Grab. Mau pesan? Langsung chat WhatsApp aja! 💬",
                    "Untuk ongkir tergantung jarak. Kalau pakai Gojek/Grab, bisa cek langsung di app mereka. Atau pesan via WhatsApp kami untuk estimasi! 📱"
                ],
                type: 'random'
            },

            pickupTime: {
                keywords: ['berapa lama', 'lama', 'siap', 'jadi', 'tunggu', 'estimasi'],
                responses: [
                    "Estimasi waktu persiapan 15-30 menit ⏱️\n\nTapi kalau lagi ramai bisa lebih lama sedikit ya. Kami usahakan secepat mungkin!",
                    "Biasanya 15-30 menit sudah siap! ⚡\n\nKalau mau lebih pasti, bisa pesan via WhatsApp dan tentukan jam pengambilan/pengantaran!"
                ],
                type: 'random'
            },

            // ==========================================
            // PEMBAYARAN
            // ==========================================
            payment: {
                keywords: ['bayar', 'pembayaran', 'transfer', 'cash', 'tunai', 'cod', 'qris', 'ovo', 'gopay', 'dana', 'shopeepay'],
                responses: [
                    "Pembayaran bisa: 💳\n• Cash saat ambil/terima pesanan\n• Transfer dulu (konfirmasi via WA)\n\nUntuk e-wallet (OVO/GoPay/DANA), tanya langsung via WhatsApp ya!",
                    "Kami terima pembayaran: 💰\n• Tunai/Cash\n• Transfer Bank\n• E-wallet (tanya via WA)\n\nPilih yang paling nyaman buat kamu!",
                    "Cara bayar: 💳\n1. Cash on delivery (COD)\n2. Transfer dulu, kirim bukti\n3. E-wallet (chat WA untuk detailnya)\n\nGampang kan?"
                ],
                type: 'random'
            },

            // ==========================================
            // PROMO & DISKON
            // ==========================================
            promo: {
                keywords: ['promo', 'diskon', 'potongan', 'sale', 'murah', 'hemat', 'voucher', 'kupon'],
                responses: [
                    "Untuk saat ini belum ada promo resmi dari Pondok Es Teller ZR. Kamu tetap bisa pilih menu hemat seperti Es Teller Original, Sop Buah Segar, atau Es Rumput Laut Spesial.",
                    "Belum ada promo yang aktif saat ini. Kalau kamu ingin pesan banyak, lebih baik konfirmasi dulu lewat WhatsApp supaya stok dan estimasi pesanan bisa dicek.",
                    "Saat ini Pondok Es Teller ZR belum menjalankan promo resmi. AE bisa bantu rekomendasikan menu minuman segar yang sesuai budget kamu."
                ],
                type: 'random'
            },

            // ==========================================
            // BAHAN & INGREDIENTS
            // ==========================================
            ingredients: {
                keywords: ['bahan', 'isi', 'terbuat', 'pakai apa', 'ingredients', 'komposisi', 'alpukat', 'buah', 'gula'],
                responses: [
                    "Kami pakai bahan premium: 🌟\n• Buah segar pilihan\n• Alpukat premium yang lembut\n• Gula asli (bukan pemanis buatan)\n• Kuah creamy yang bikin nagih\n• Es batu dari air matang\n\nSemuanya dijaga kebersihannya!",
                    "Bahan-bahan kami: 🥑\n✓ Alpukat segar berkualitas\n✓ Buah-buahan pilihan\n✓ Gula asli (no pemanis buatan)\n✓ Susu creamy\n✓ Es batu higienis\n\nDijamin segar dan aman!",
                    "Kami selektif pilih bahan: 🍓\n• Alpukat: Premium, lembut, legit\n• Buah: Segar setiap hari\n• Gula: Asli, bukan pemanis\n• Kuah: Creamy dan manis pas\n\nMakanya enak dan bikin nagih!"
                ],
                type: 'random'
            },

            halal: {
                keywords: ['halal', 'haram', 'muslim', 'islam'],
                responses: [
                    "Tenang, semua bahan kami halal kok! ✅\n\nKami pakai bahan-bahan alami: buah segar, alpukat, gula asli, dan susu. Aman untuk Muslim!",
                    "100% Halal! ☪️\n\nSemua bahan natural dan tidak ada bahan haram. Bisa dinikmati semua kalangan dengan tenang!"
                ],
                type: 'random'
            },

            // ==========================================
            // CARA PESAN
            // ==========================================
            howToOrder: {
                keywords: ['cara pesan', 'gimana pesan', 'bagaimana pesan', 'cara order', 'gimana order', 'pesan gimana'],
                responses: [
                    "Cara pesan gampang banget! 📱\n\n1️⃣ Pilih menu di bawah\n2️⃣ Klik 'Tambah ke Pesanan'\n3️⃣ Isi form (nama, metode, tanggal, jam)\n4️⃣ Klik 'Kirim ke WhatsApp'\n5️⃣ Tunggu konfirmasi dari kami\n\nPraktis kan?",
                    "Langkah-langkah pesan: 🛒\n\n✓ Scroll ke bagian 'Menu'\n✓ Pilih menu favorit kamu\n✓ Isi form pemesanan lengkap\n✓ Kirim via WhatsApp\n✓ Kami proses pesanan kamu!\n\nGampang banget!",
                    "Mau pesan? Gini caranya: 📝\n\n1. Lihat menu di bawah\n2. Tambahkan ke keranjang\n3. Isi data diri & pilih waktu\n4. Klik tombol WhatsApp\n5. Selesai! Tinggal tunggu es teller segar! 🧊"
                ],
                type: 'random'
            },

            whatsapp: {
                keywords: ['whatsapp', 'wa', 'nomor', 'kontak', 'hubungi', 'telepon', 'telp', 'hp'],
                responses: [
                    "Nomor WhatsApp kami: 📱\n• WA Utama: 0813-7411-0444\n• WA Kedua: 0813-6348-9111\n\nLangsung chat aja ya! Kami fast response kok! 😊",
                    "Hubungi kami via WhatsApp: 💬\n\n📞 0813-7411-0444 (Utama)\n📞 0813-6348-9111 (Alternatif)\n\nSiap melayani kamu!",
                    "Kontak kami: 📲\n\nWhatsApp 1: 0813-7411-0444\nWhatsApp 2: 0813-6348-9111\n\nChat kapan aja, kami siap bantu!"
                ],
                type: 'random'
            },

            // ==========================================
            // PORSI & UKURAN
            // ==========================================
            portion: {
                keywords: ['porsi', 'besar', 'kecil', 'ukuran', 'banyak', 'sedikit', 'jumbo', 'mini'],
                responses: [
                    "Porsi kami ada beberapa: 🥤\n• Regular: Pas untuk 1 orang\n• Jumbo: Lebih besar, bikin puas!\n• Paket Keluarga: Untuk 4-5 orang\n\nMau yang mana?",
                    "Ukuran porsi: 📏\n✓ Es Teller Original/Campur: Porsi standar\n✓ Es Teller Jumbo: Porsi besar (1.5x)\n✓ Paket Keluarga: Untuk ramai-ramai\n\nPilih sesuai selera ya!"
                ],
                type: 'random'
            },

            // ==========================================
            // RASA & KUALITAS
            // ==========================================
            taste: {
                keywords: ['rasa', 'enak', 'manis', 'asam', 'segar', 'creamy', 'legit'],
                responses: [
                    "Rasa Es Teller ZR: 😋\n• Manis pas (tidak terlalu manis)\n• Segar dari buah pilihan\n• Creamy dari alpukat premium\n• Dingin yang bikin adem\n\nBanyak yang bilang nagih! Mau coba?",
                    "Karakteristik rasa kami: 🌟\n✓ Manis alami dari gula asli\n✓ Segar dari buah-buahan\n✓ Creamy lembut dari alpukat\n✓ Dingin menyegarkan\n\nRating 4.8+ dari pelanggan!"
                ],
                type: 'random'
            },

            // ==========================================
            // TESTIMONI & REVIEW
            // ==========================================
            review: {
                keywords: ['review', 'testimoni', 'pendapat', 'kata orang', 'rating', 'bintang'],
                responses: [
                    "Review pelanggan kami rata-rata 4.8 bintang! ⭐⭐⭐⭐⭐\n\nBanyak yang bilang:\n• Alpukatnya melimpah\n• Rasanya segar dan pas\n• Harga worth it\n• Pelayanan ramah\n\nLihat testimoni lengkap di bagian 'Testimoni' ya!",
                    "Kata pelanggan kami: 💬\n\n'Alpukatnya banyak banget!'\n'Segar dan bikin nagih!'\n'Harga terjangkau, rasa juara!'\n\nRating: 4.8/5.0 ⭐\n\nMau jadi pelanggan setia juga?"
                ],
                type: 'random'
            },

            // ==========================================
            // PERTANYAAN UMUM SEHARI-HARI
            // ==========================================
            weather: {
                keywords: ['cuaca', 'panas', 'hujan', 'gerah', 'dingin'],
                responses: [
                    "Cuaca lagi panas? Pas banget nih pesan Es Teller ZR! 🌞🧊\n\nDingin, segar, bikin adem. Cocok buat cuaca Padang yang panas!",
                    "Lagi gerah ya? Es Teller ZR solusinya! ☀️\n\nSegar, dingin, dan bikin mood naik. Yuk pesan sekarang!"
                ],
                type: 'random'
            },

            hungry: {
                keywords: ['lapar', 'haus', 'pengen', 'pengin', 'mau makan', 'mau minum'],
                responses: [
                    "Lagi haus? Es Teller ZR jawabannya! 🧊\n\nSegar, dingin, dan bikin kenyang. Cocok buat cemilan sore atau dessert!",
                    "Pengen yang segar-segar? 🍧\n\nEs Teller ZR pas banget! Buah segar, alpukat melimpah, dan dingin menyegarkan. Yuk pesan!"
                ],
                type: 'random'
            },

            bored: {
                keywords: ['bosan', 'boring', 'jenuh', 'gabut'],
                responses: [
                    "Lagi gabut? Yuk pesan Es Teller ZR! 😊\n\nBisa jadi teman santai sore atau nongkrong bareng teman. Segar dan bikin mood naik!",
                    "Bosan di rumah? Mampir ke Pondok Es Teller ZR yuk! 🍧\n\nAtau pesan delivery aja biar bisa santai di rumah sambil nikmatin es teller segar!"
                ],
                type: 'random'
            },

            // ==========================================
            // PERTANYAAN SPESIFIK
            // ==========================================
            parking: {
                keywords: ['parkir', 'tempat parkir', 'parkirnya'],
                responses: [
                    "Ada tempat parkir kok! 🅿️\n\nTenang aja, kamu bisa parkir motor atau mobil. Tempatnya cukup luas dan aman!",
                    "Parkir tersedia! 🚗🏍️\n\nGak perlu khawatir, ada area parkir yang cukup untuk motor dan mobil."
                ],
                type: 'random'
            },

            wifi: {
                keywords: ['wifi', 'internet', 'wi-fi'],
                responses: [
                    "Untuk info WiFi, bisa tanya langsung saat di toko ya! 📶\n\nFokus kami adalah menyajikan es teller segar untuk kamu! 😊"
                ],
                type: 'random'
            },

            toilet: {
                keywords: ['toilet', 'wc', 'kamar mandi', 'kamar kecil'],
                responses: [
                    "Untuk fasilitas toilet, bisa tanya langsung saat di toko ya! 🚻\n\nKami fokus melayani es teller segar untuk kamu!"
                ],
                type: 'random'
            },

            group: {
                keywords: ['rombongan', 'ramai', 'banyak', 'keluarga', 'teman', 'kantor', 'arisan'],
                responses: [
                    "Mau pesan untuk rombongan? Bisa banget! 👥\n\nKami punya Paket Keluarga (Rp55.000) untuk 4-5 orang. Atau bisa pesan banyak sekaligus. Chat WhatsApp untuk order ya!",
                    "Pesanan ramai-ramai? Siap! 🎉\n\nPaket Keluarga kami cocok untuk gathering, arisan, atau acara kantor. Bisa juga custom sesuai kebutuhan. Hubungi WA kami!"
                ],
                type: 'random'
            }
        };
    }

    // Fuzzy matching untuk mengenali variasi pertanyaan
    findBestMatch(question) {
        const q = question.toLowerCase().trim();
        let bestMatch = null;
        let highestScore = 0;

        for (const [key, data] of Object.entries(this.knowledgeBase)) {
            let score = 0;
            
            for (const keyword of data.keywords) {
                if (q.includes(keyword)) {
                    score += keyword.length; // Keyword lebih panjang = lebih spesifik
                }
            }

            if (score > highestScore) {
                highestScore = score;
                bestMatch = { key, data };
            }
        }

        return highestScore > 0 ? bestMatch : null;
    }

    // Generate response berdasarkan match
    generateResponse(match) {
        if (!match) return this.getFallbackResponse();

        const { data } = match;

        if (data.type === 'random') {
            // Pilih response random
            return data.responses[Math.floor(Math.random() * data.responses.length)];
        } else if (data.type === 'function') {
            // Execute function untuk dynamic response
            return data.response(this);
        }

        return this.getFallbackResponse();
    }

    // Fallback response yang helpful
    getFallbackResponse() {
        const fallbacks = [
            "Hmm, saya belum paham pertanyaan itu 🤔\n\nCoba tanya tentang:\n• Menu & harga\n• Jam buka\n• Lokasi\n• Cara pesan\n• Delivery\n• Promo\n\nAtau langsung chat WhatsApp kami ya!",
            "Maaf, saya belum bisa jawab pertanyaan itu 😅\n\nTapi kamu bisa:\n✓ Lihat menu di bawah\n✓ Chat WhatsApp: 0813-7411-0444\n✓ Tanya hal lain tentang Es Teller ZR\n\nAda yang bisa saya bantu lagi?",
            "Wah, pertanyaan menarik! Tapi saya belum tahu jawabannya 🙈\n\nUntuk info lebih detail, langsung chat WhatsApp kami ya:\n📱 0813-7411-0444\n\nAtau tanya hal lain yang saya bisa bantu!"
        ];

        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // Main chat function
    chat(question) {
        if (!question || question.trim().length === 0) {
            return "Silakan ketik pertanyaan kamu 😊";
        }

        // Save to history
        this.conversationHistory.push({
            type: 'user',
            message: question,
            timestamp: new Date()
        });

        // Find best match
        const match = this.findBestMatch(question);
        
        // Generate response
        const response = this.generateResponse(match);

        // Save response to history
        this.conversationHistory.push({
            type: 'bot',
            message: response,
            timestamp: new Date()
        });

        return response;
    }

    // Helper: Format price
    formatPrice(price) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(price);
    }

    // Update menu data (untuk real-time sync)
    updateMenuData(newMenuData) {
        this.menuData = newMenuData;
    }

    // Get conversation history
    getHistory() {
        return this.conversationHistory;
    }

    // Clear history
    clearHistory() {
        this.conversationHistory = [];
    }
}

// Export untuk digunakan di index.html
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartChatbot;
}
