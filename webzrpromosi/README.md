# 🍧 Pondok Es Teller ZR - Website Promosi

Website promosi modern untuk Pondok Es Teller ZR di Kota Padang dengan fitur-fitur canggih untuk meningkatkan pengalaman pelanggan dan konversi penjualan.

## 🌐 Live Demo

**URL**: [https://estellerzrpadang.vercel.app/](https://estellerzrpadang.vercel.app/)

---

## ✨ Fitur Utama

### 🎨 **User Interface**
- ✅ Desain modern dan responsive (Mobile-first)
- ✅ **Dark Mode / Light Mode** dengan auto-detect sistem
- ✅ Animasi smooth scroll reveal
- ✅ Skeleton loading untuk UX yang lebih baik
- ✅ PWA-ready (Progressive Web App)

### 🤖 **Smart AI Chatbot**
- ✅ Natural Language Processing untuk pertanyaan bebas
- ✅ Menjawab pertanyaan tentang menu, harga, lokasi, delivery
- ✅ Quick reply buttons untuk pertanyaan umum
- ✅ Typing indicator untuk pengalaman natural
- ✅ Context-aware responses berdasarkan data menu real-time

### 📦 **Sistem Pemesanan**
- ✅ Form pemesanan lengkap dengan validasi
- ✅ **Delivery Time Picker** (tanggal + jam)
- ✅ **Estimasi Waktu Persiapan** (15-30 menit)
- ✅ Validasi otomatis untuk jam yang sudah lewat
- ✅ Keranjang belanja dengan persistence (localStorage)
- ✅ Integrasi WhatsApp untuk konfirmasi pesanan
- ✅ Pilihan metode: Ambil Sendiri / Delivery

### 📊 **Backend & Database**
- ✅ Integrasi Supabase (Cloud Database)
- ✅ Real-time menu sync
- ✅ Sistem review pelanggan dengan smart algorithm
- ✅ Auto-select 3 review terbaik (rating 5 + kata positif)
- ✅ Fallback ke localStorage jika offline

### 🔍 **SEO & Performance**
- ✅ **Valid sitemap.xml** dengan priority & changefreq
- ✅ Schema.org JSON-LD untuk rich snippets
- ✅ Open Graph tags untuk social media
- ✅ Google Analytics integration
- ✅ Lazy loading untuk gambar
- ✅ Optimized meta tags

### 📱 **Mobile Features**
- ✅ Responsive design untuk semua ukuran layar
- ✅ Touch-friendly buttons dan forms
- ✅ Native date/time picker di mobile
- ✅ Floating action buttons (WhatsApp, AI, Cart, Theme)

---

## 🚀 Teknologi yang Digunakan

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, Animations
- **Vanilla JavaScript** - No framework, pure performance
- **Service Worker** - PWA support

### Backend & Database
- **Supabase** - PostgreSQL cloud database
- **Supabase Storage** - Image hosting
- **Real-time subscriptions** - Live data sync

### Deployment
- **Vercel** - Serverless deployment
- **GitHub** - Version control
- **Custom domain** - estellerzrpadang.vercel.app

### Analytics & Monitoring
- **Google Analytics** - Traffic tracking
- **Google Tag Manager** - Event tracking

---

## 📁 Struktur Folder

```
webzrpromosi/
├── index.html              # Main HTML file (2000+ lines)
├── sitemap.xml             # Valid XML sitemap
├── robots.txt              # Search engine directives
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for PWA
├── supabase-config.js      # Supabase configuration
├── supabase-setup.sql      # Database schema
├── vercel.json             # Vercel deployment config
├── UPGRADE_NOTES.md        # Upgrade documentation
├── README.md               # This file
└── foto2/                  # Images folder
    ├── logo_zr.png
    ├── herobackground.jpg
    └── estelleroriginal.jpg
```

---

## 🎯 Fitur Baru (Update 7 Mei 2026)

### 1. 🌓 Dark Mode / Light Mode
- Toggle manual dengan tombol di kiri bawah
- Auto-detect preferensi sistem
- Menyimpan preferensi di localStorage
- Smooth transition animation

### 2. 🤖 Smart AI Chatbot
- Input text bebas untuk pertanyaan
- Keyword-based NLP untuk response
- Context-aware berdasarkan menu real-time
- Quick reply buttons
- Typing indicator

### 3. 📅 Delivery Time Picker
- Pilih tanggal (hari ini - 7 hari ke depan)
- Pilih jam (10:00 - 22:00 WIB)
- Validasi otomatis
- Terintegrasi dengan WhatsApp message

### 4. ⏱️ Estimasi Waktu Delivery
- Real-time calculation
- Peringatan untuk jam yang lewat
- Alert untuk pesanan mendesak
- Visual feedback dengan warna

### 5. 🗺️ Valid Sitemap.xml
- Sesuai standar sitemaps.org
- Mencakup semua halaman penting
- Priority dan changefreq untuk setiap URL
- Last modified date

---

## 🛠️ Setup & Installation

### Prerequisites
- Web browser modern (Chrome, Firefox, Safari, Edge)
- Internet connection (untuk Supabase sync)

### Local Development
```bash
# Clone repository
git clone https://github.com/rannn2008/estellerzrpadang.git

# Navigate to folder
cd webzrpromosi

# Open with live server atau langsung buka index.html
```

### Deployment ke Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 🔧 Konfigurasi

### Supabase Setup
1. Buat project di [supabase.com](https://supabase.com)
2. Jalankan SQL di `supabase-setup.sql`
3. Update `supabase-config.js` dengan credentials Anda
4. Enable Row Level Security (RLS) untuk keamanan

### Google Analytics
Update Google Analytics ID di `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
```

### WhatsApp Numbers
Update nomor WhatsApp di `index.html`:
```javascript
const whatsappMain = "6281374110444";
const whatsappSecond = "6281363489111";
```

---

## 📊 Database Schema

### Table: `menus`
```sql
- id (uuid, primary key)
- name (text)
- price (numeric)
- description (text)
- image_url (text)
- rating (text)
- badges (text[])
- status (text)
- sort_order (integer)
- created_at (timestamp)
```

### Table: `reviews`
```sql
- id (uuid, primary key)
- name (text)
- rating (integer)
- comment (text)
- created_at (timestamp)
```

---

## 🎨 Customization

### Warna (CSS Variables)
```css
:root {
    --green: #147a3f;
    --green-dark: #0d4f30;
    --lime: #b7e044;
    --yellow: #ffd447;
    --orange: #ff8f3f;
    --cream: #fff8df;
}
```

### Font
Default: Arial, Helvetica, sans-serif
Bisa diganti dengan Google Fonts atau custom font

---

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Full Support |
| Firefox | 88+     | ✅ Full Support |
| Safari  | 14+     | ✅ Full Support |
| Edge    | 90+     | ✅ Full Support |
| Mobile  | iOS 14+, Android 10+ | ✅ Full Support |

---

## 🐛 Known Issues

- ❌ Tidak ada issue yang diketahui saat ini

---

## 🚀 Roadmap

### Phase 2 (Coming Soon)
- [ ] Payment Gateway (Midtrans/Xendit)
- [ ] Real-time order tracking
- [ ] Customer loyalty program
- [ ] Email marketing integration
- [ ] Instagram feed integration
- [ ] Multi-language support (EN)

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Admin dashboard upgrade
- [ ] Inventory management
- [ ] Sales analytics
- [ ] CRM integration

---

## 📄 License

© 2026 Pondok Es Teller ZR. All rights reserved.

---

## 👨‍💻 Developer

Developed with ❤️ by AI Assistant (Kiro)

---

## 📞 Contact

**Pondok Es Teller ZR**
- 📍 Jl. Kalumbuk No21, Kota Padang
- 📱 WhatsApp: 0813-7411-0444 / 0813-6348-9111
- 🕙 Buka: 10.00 - 22.00 WIB (Setiap Hari)
- 🌐 Website: https://estellerzrpadang.vercel.app/

---

## 🙏 Acknowledgments

- Unsplash & Pexels untuk stock images
- Supabase untuk backend infrastructure
- Vercel untuk hosting
- Google untuk Analytics & Maps

---

**⭐ Jangan lupa beri bintang di GitHub jika website ini membantu!**
## Google Search Console

- Submit sitemap: `https://estellerzrpadang.vercel.app/sitemap.xml`
- Pantau performa keyword lokal seperti `es teler Padang`, `es teller Padang`, `sop buah Padang`, dan `minuman segar Padang`.
- Cek halaman dan query yang paling banyak menghasilkan impresi, lalu gunakan datanya untuk memperbarui teks menu, lokasi, dan konten halaman utama.
- Pastikan profil Google Maps/Google Business memakai nama, alamat, jam buka, dan nomor WhatsApp yang konsisten dengan website.

---

## Google AdSense

- Daftarkan domain produksi: `https://estellerzrpadang.vercel.app/`
- Pastikan halaman `Privacy Policy` dan `Syarat Penggunaan` bisa dibuka sebelum mengirim review AdSense.
- Kode AdSense belum diaktifkan di website. Placeholder tersedia di bagian `<head>` halaman utama dan halaman legal.
- Setelah akun/site disetujui dan client ID asli sudah siap, ganti komentar placeholder:
  `<!-- Google AdSense code will be added here after approval. Do not use fake ca-pub ID. -->`
  dengan script resmi dari Google AdSense.
- Jangan menambahkan teks ajakan seperti "klik iklan" atau tombol palsu yang menyerupai iklan.

---
