# TitikTemu — Co-Working Space Management & Booking System

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)](https://www.docker.com/)
[![Midtrans](https://img.shields.io/badge/Payment-Midtrans_Snap-blue)](https://midtrans.com/)
[![Swagger](https://img.shields.io/badge/Swagger-API_Docs-85EA2D?logo=swagger&logoColor=black)](http://localhost:5000/api/docs)

**TitikTemu** adalah platform manajemen dan pemesanan slot area kerja (*co-working space*) berbasis web yang dirancang untuk memberikan kemudahan bagi pengguna dalam mencari dan memesan ruangan secara *real-time*. Proyek ini diimplementasikan sebagai aplikasi *full-stack* modern yang mengintegrasikan gerbang pembayaran (*payment gateway*) Midtrans untuk simulasi transaksi yang aman dan andal.

Aplikasi ini sangat cocok digunakan sebagai portofolio profesional karena dibangun menggunakan praktik arsitektur perangkat lunak terkini (*clean code*, manajemen lingkungan terisolasi dengan Docker, dan keamanan berbasis JWT httpOnly).

---

## 🚀 Fitur Utama

### 🧑 Antarmuka Pengguna (User Side)
*   **Autentikasi & Profil Aman:** Registrasi, login, dan manajemen profil dengan keamanan berbasis stateless JWT melalui *httpOnly cookies* (melindungi dari serangan XSS).
*   **Eksplorasi Ruang Kerja:** Pencarian dan detail area kerja yang tersedia beserta fasilitas yang disediakan.
*   **Pemesanan Real-Time:** Sistem pemesanan slot waktu interaktif yang secara otomatis memvalidasi jadwal agar tidak terjadi *double-booking*.
*   **Integrasi Pembayaran (Midtrans Snap):** Alur checkout terintegrasi menggunakan Midtrans Snap SDK untuk simulasi pembayaran instan (Bank Transfer, E-Wallet, dll.).
*   **Dashboard Pengguna:** Melihat riwayat pemesanan, status transaksi (Pending, Success, Cancelled), dan cetak bukti reservasi.

### 👑 Panel Administrasi (Admin Side)
*   **Dashboard Statistik:** Ringkasan performa bisnis seperti total pendapatan, jumlah pengguna terdaftar, dan jumlah reservasi aktif.
*   **Manajemen Area Kerja (CRUD):** Tambah, ubah, dan hapus data ruangan, kapasitas, fasilitas, serta harga per jam.
*   **Manajemen Transaksi & Reservasi:** Memantau semua pemesanan pengguna dan memperbarui status pemesanan secara manual jika diperlukan.
*   **Manajemen Pengguna:** Melihat daftar seluruh pengguna terdaftar di sistem.

---

## 🛠️ Teknologi yang Digunakan

| Lapisan (Layer) | Teknologi | Kegunaan |
|---|---|---|
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS | Kerangka kerja UI interaktif, SEO-friendly, dan responsif. |
| **Backend API** | [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), TypeScript | Penyedia RESTful API berkinerja tinggi. |
| **Database** | [MongoDB 7](https://www.mongodb.com/) & [Mongoose ODM](https://mongoosejs.com/) | Penyimpanan data fleksibel berbasis dokumen. |
| **Autentikasi** | JSON Web Tokens (JWT) | Otentikasi stateless menggunakan *cookie* aman (*httpOnly*). |
| **Payment Gateway** | [Midtrans Snap API](https://midtrans.com/) | Simulasi alur pembayaran digital terintegrasi. |
| **Virtualisasi** | [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) | Standardisasi dan kemudahan *deployment* lingkungan aplikasi. |

---

## 📁 Struktur Proyek

```text
.
├── backend/                  # RESTful API Service (Express.js)
│   ├── src/
│   │   ├── config/           # Konfigurasi database & library
│   │   ├── controllers/      # Logika bisnis API
│   │   ├── middleware/       # Autentikasi JWT & validasi role
│   │   ├── models/           # Skema MongoDB (Mongoose)
│   │   ├── routes/           # Routing API endpoints
│   │   ├── scripts/          # Skrip seeder database
│   │   └── utils/            # Helper fungsi umum
│   ├── Dockerfile
│   └── .env.example          # Template konfigurasi lokal backend
│
├── frontend/                 # Client Application (Next.js 14)
│   ├── src/
│   │   ├── app/              # Routing berbasis file (App Router)
│   │   ├── components/       # Komponen UI reusable (Tailwind CSS)
│   │   ├── lib/              # Client API wrapper & Context Store
│   │   └── types/            # Definisi tipe TypeScript
│   ├── public/               # Asset statis (gambar, ikon)
│   ├── Dockerfile
│   └── .env.example          # Template konfigurasi lokal frontend
│
├── docker-compose.yml        # Orkestrasi multi-kontainer Docker
└── .env.example              # Template konfigurasi utama Docker Compose
```

---

## ⚙️ Panduan Instalasi & Menjalankan Aplikasi

Aplikasi dapat dijalankan melalui dua metode: **Menggunakan Docker (Sangat Direkomendasikan)** atau **Menjalankan secara Natively**.

### Metode A: Menggunakan Docker Compose (Instalasi Cepat)

Pastikan Anda telah menginstal [Docker Desktop](https://www.docker.com/products/docker-desktop/) di komputer Anda.

1.  **Salin File Environment Variable:**
    Buat berkas `.env` baru berdasarkan template yang disediakan:
    ```bash
    cp .env.example .env
    ```
    *Catatan: Buka file `.env` dan masukkan kunci api Midtrans Sandbox Anda di bagian `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY`.*

2.  **Jalankan Kontainer Aplikasi:**
    Bangun dan jalankan seluruh servis (Frontend, Backend, & MongoDB):
    ```bash
    docker compose up --build -d
    ```

3.  **Seed Database (Data Awal):**
    Jalankan skrip berikut untuk mengisi database dengan sampel data *spaces* (ruangan) dan akun pengujian:
    ```bash
    docker exec coworking_backend npm run seed
    ```

Aplikasi sekarang dapat diakses melalui browser Anda:
*   **Frontend Web:** [http://localhost:3000](http://localhost:3000)
*   **Backend REST API:** [http://localhost:5000/api](http://localhost:5000/api)
*   **Dokumentasi API (Swagger UI):** [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
*   **MongoDB Instance:** `localhost:27017`

---

### Metode B: Menjalankan Natively (Pengembangan Lokal Tanpa Docker)

Jika Anda ingin melakukan debugging secara lokal tanpa containerisasi:

#### 1. Prasyarat
*   [Node.js](https://nodejs.org/) (versi 18 ke atas) terpasang.
*   [MongoDB](https://www.mongodb.com/try/download/community) terpasang dan berjalan secara lokal pada port default `27017`.

#### 2. Konfigurasi Lingkungan (.env)
*   Pada folder root proyek, buat file `.env` dari `.env.example`
*   Pada folder `/backend`, salin file `.env.example` menjadi `.env`
*   Pada folder `/frontend`, salin file `.env.example` menjadi `.env.local`

#### 3. Menjalankan Backend API
```bash
cd backend
npm install
npm run build      # Melakukan kompilasi TypeScript
npm run seed       # Mengisi data demo ke MongoDB
npm run dev        # Menjalankan server dalam mode development
```
*Server API backend akan berjalan di [http://localhost:5000](http://localhost:5000).*

#### 4. Menjalankan Frontend Next.js
```bash
cd frontend
npm install
npm run dev
```
*Aplikasi frontend Next.js akan berjalan di [http://localhost:3000](http://localhost:3000).*

---

## 📖 Dokumentasi API (Swagger UI)

Proyek ini dilengkapi dengan dokumentasi API interaktif menggunakan **Swagger UI**. Hal ini memudahkan Anda untuk meninjau seluruh daftar endpoint, format request (header, body, parameter), tipe data model, serta melakukan pengujian API secara langsung dari browser.

### Cara Mengakses:
1. Pastikan server backend sedang berjalan (baik melalui Docker maupun secara native).
2. Buka browser dan akses tautan berikut:
   * **Swagger UI Docs:** [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

### Fitur Dokumentasi:
*   **Pengujian Interaktif:** Anda dapat mencoba langsung setiap endpoint (seperti registrasi, login, pemesanan, dll.) menggunakan tombol **"Try it out"**.
*   **Otentikasi Cookie (JWT):** Setelah berhasil login melalui endpoint `/api/auth/login`, cookie JWT (`token`) akan tersimpan di browser secara otomatis untuk mengotorisasi endpoint lain.

---

## 🔑 Akun Uji Coba Default (Demo Accounts)

Setelah menjalankan skrip seeder (`npm run seed`), Anda dapat menggunakan akun berikut untuk menguji fitur aplikasi:

| Peran (Role) | Email | Kata Sandi (Password) |
| :--- | :--- | :--- |
| **Administrator (Admin)** | `admin@ledger.com` | `Admin@1234` |
| **Pengguna Umum (User)** | `user@ledger.com` | `User@1234` |

---