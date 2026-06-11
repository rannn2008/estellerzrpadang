# ZR SmartOrder AI

## Nama Aplikasi

ZR SmartOrder AI

## Deskripsi Singkat

ZR SmartOrder AI adalah MVP platform digital berbasis Generative AI untuk membantu UMKM kuliner Pondok Es Teller ZR Padang mengelola menu, stok, pesanan, customer service, promosi, dan ringkasan penjualan.

Website landing Pondok Es Teller ZR tetap dipertahankan. Fitur challenge ditambahkan lewat halaman:

- `smartorder.html` untuk customer/client.
- `admin-smartorder.html` untuk admin UMKM.

## Latar Belakang Masalah UMKM

Banyak UMKM kuliner masih mengelola pesanan, stok, promosi, dan laporan secara manual. Dampaknya:

- Respon pelanggan lambat saat banyak pertanyaan.
- Catatan order dan stok mudah tercecer.
- Promosi di WhatsApp/Instagram sulit dibuat konsisten.
- Pemilik usaha sulit membaca menu terlaris dan kebutuhan stok.

## Solusi yang Dibangun

ZR SmartOrder AI membantu digitalisasi UMKM dengan:

- Menu online dari database Supabase.
- Keranjang dan order digital.
- Dashboard admin untuk produk, stok, dan status order.
- AE Assistant untuk menjawab pertanyaan customer.
- AI Caption Generator untuk promosi.
- AI Product Description Generator untuk deskripsi menu.
- AI Sales Insight untuk ringkasan penjualan dan saran stok/promo.

## Fitur Utama

- Landing page Pondok Es Teller ZR tetap aktif.
- Customer melihat menu dari tabel `products`.
- Filter kategori menu.
- Status menu tersedia/habis dan stok.
- Keranjang sederhana.
- Submit order ke tabel `orders` dan `order_items`.
- Ringkasan order dan tombol kirim WhatsApp admin.
- Login customer opsional memakai Supabase Auth.
- Login admin memakai Supabase Auth.
- Role admin/client melalui tabel `profiles`.
- Admin dashboard untuk statistik, order, status order, dan CRUD produk.
- Generative AI berjalan server-side melalui `/api/ai`.

## Teknologi yang Digunakan

- HTML, CSS, JavaScript vanilla.
- Supabase Auth.
- Supabase Database dan Row Level Security.
- Supabase Realtime-ready data structure.
- Vercel Static Hosting.
- Vercel Serverless Function untuk endpoint AI.
- OpenAI-compatible Responses API melalui environment variable server-side.

## AI Digunakan Untuk Apa Saja

1. AE Assistant untuk customer:
   - Menjawab pertanyaan menu.
   - Memberi rekomendasi dari menu yang tersedia.
   - Mengarahkan customer ke checkout/WhatsApp.

2. AI Caption Generator:
   - Membuat 3 caption WhatsApp/Instagram.
   - Membuat hashtag.
   - Membuat versi pendek untuk story.

3. AI Product Description Generator:
   - Membuat deskripsi menu yang singkat dan menarik.

4. AI Sales Insight:
   - Meringkas penjualan hari ini.
   - Membaca menu paling laris.
   - Memberi saran stok dan promo besok.

## Cara Menjalankan Project

Project ini static site, jadi tidak membutuhkan PHP atau framework build.

Cara lokal sederhana:

1. Buka folder `webzrpromosi`.
2. Jalankan static server lokal, misalnya dengan ekstensi Live Server atau server statis lain.
3. Buka `index.html`, `smartorder.html`, atau `admin-smartorder.html`.

Untuk Vercel:

1. Push project ke GitHub.
2. Import repository ke Vercel.
3. Set environment variables.
4. Deploy.

## Environment Variables

Frontend/static:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Catatan: project static saat ini membaca konfigurasi dari `supabase-config.js`. Untuk production yang lebih rapi, nilai Supabase bisa diganti lewat proses build atau tetap memakai public anon key Supabase.

Server-side Vercel Function:

- `AI_API_KEY`
- `AI_MODEL` optional, default `gpt-4.1-mini`
- `SUPABASE_SERVICE_ROLE_KEY` optional untuk menyimpan log AI dari server
- `SUPABASE_URL` atau `VITE_SUPABASE_URL`

Jangan taruh `AI_API_KEY` atau `SUPABASE_SERVICE_ROLE_KEY` di frontend.

## Struktur Database Supabase

File schema tersedia di:

```txt
supabase/schema.sql
```

Tabel utama:

- `profiles`
- `products`
- `orders`
- `order_items`
- `ai_logs`

RLS policy:

- Public/client membaca produk yang `is_available = true`.
- Public/client dapat membuat order dan item order.
- Admin dapat membaca dan mengubah semua data produk, order, item order, profile, dan log AI.
- AI log dapat dibuat oleh user login atau server-side service role.

## Setup Supabase

1. Buka Supabase SQL Editor.
2. Jalankan isi `supabase/schema.sql`.
3. Buat akun admin melalui Supabase Auth.
4. Setelah user dibuat, ubah role di tabel `profiles`:

```sql
update public.profiles
set role = 'admin'
where id = 'USER_ID_ADMIN';
```

5. Pastikan `supabase-config.js` berisi Supabase URL dan anon key.
6. Coba login di `admin-smartorder.html`.

## Link Demo Placeholder

https://estellerzrpadang.vercel.app/

Halaman MVP:

- https://estellerzrpadang.vercel.app/smartorder.html
- https://estellerzrpadang.vercel.app/admin-smartorder.html

## Akun Demo Admin Placeholder

Email: `admin@example.com`

Password: `isi-di-supabase-auth`

Catatan: akun demo harus dibuat manual di Supabase Auth, lalu role-nya diubah menjadi `admin` di tabel `profiles`.

## Dampak untuk UMKM

ZR SmartOrder AI membantu Pondok Es Teller ZR Padang memulai digitalisasi tanpa sistem yang rumit. Pemilik usaha bisa melihat order masuk, mengatur stok, membuat promosi dengan AI, dan membaca insight penjualan harian secara lebih cepat.
