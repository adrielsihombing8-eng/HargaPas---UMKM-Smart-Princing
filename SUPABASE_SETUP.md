# Panduan Lengkap Backend Supabase & Google OAuth — HargaPas UMKM

Dokumen ini berisi langkah-langkah lengkap sesuai **tampilan Dashboard Supabase terbaru** untuk menghubungkan aplikasi **HargaPas UMKM** ke backend **Supabase** (PostgreSQL Database, Row Level Security, Email/Password Auth, dan **Google OAuth**).

> **Dual-Mode Otomatis:** Aplikasi sudah terintegrasi penuh dengan Supabase di `src/lib/supabase.ts`, `src/services/supabaseService.ts`, `src/store/HargaPasContext.tsx`, dan `src/modules/AuthPage.tsx`.
> - Jika `.env` **belum diisi**, aplikasi otomatis berjalan dalam **Mode Lokal (Dummy Data)**.
> - Jika `.env` **sudah diisi**, aplikasi otomatis aktif menggunakan **Supabase Auth (Email & Google OAuth) + Database PostgreSQL**.

---

## Langkah 1: Buat Proyek & Ambil URL + API Key Supabase

1. Buka [https://supabase.com/dashboard](https://supabase.com/dashboard) lalu masuk / daftar akun.
2. Klik **New project** *(Catatan: pada Free Plan maksimal **2 project aktif** di semua organization; jika penuh, **Pause** salah satu project lama yang tidak terpakai)*.
3. Pilih Organization, lalu isi:
   - **Name:** `hargapas-umkm`
   - **Database Password:** buat password yang kuat dan simpan.
   - **Region:** pilih `Southeast Asia (Singapore)`.
4. Klik **Create new project** dan tunggu ±1–2 menit hingga proyek aktif.
5. **Ambil Project URL (`VITE_SUPABASE_URL`):**
   - Di bilah ikon paling kiri, klik ikon **Settings** (roda gigi di bagian bawah) → di submenu kiri pilih **INTEGRATIONS → Data API** (atau klik tombol hijau **Connect** di bagian atas halaman).
   - Salin **Project URL** Anda, bentuknya:
     ```text
     https://<PROJECT_ID>.supabase.co
     ```
     *(Kode `<PROJECT_ID>` juga bisa dilihat langsung pada URL browser: `supabase.com/dashboard/project/<PROJECT_ID>/...`)*
6. **Ambil API Key (`VITE_SUPABASE_ANON_KEY`):**
   - Masih di **Settings**, pilih **CONFIGURATION → API Keys**.
   - Pada bagian **Publishable key**, klik tombol *copy* pada baris **`default`** (`sb_publishable_...`).
   - *(Opsional: jika ingin memakai format JWT `eyJ...`, klik tombol **View legacy API keys** di kanan atas lalu salin kunci `anon`.)*
   - **Jangan** pernah menyalin **Secret keys** (`sb_secret_...`) ke file `.env` frontend.

---

## Langkah 2: Jalankan Schema Database, RLS & Trigger

Semua tabel, indeks, keamanan **Row Level Security (RLS)**, dan *trigger* pembuatan profil otomatis sudah disiapkan di file `supabase/schema.sql`.

1. Di bilah ikon paling kiri Supabase Dashboard, klik **SQL Editor** (ikon `>_` / dokumen SQL), lalu klik **New query**.
2. Salin seluruh isi file **`supabase/schema.sql`**, tempel ke editor, lalu klik **Run** (atau `Ctrl + Enter`).
3. Pastikan muncul pesan **`Success. No rows returned`**.
4. Buka menu **Table Editor** di bilah ikon kiri untuk memastikan 8 tabel berikut sudah terbentuk:
   - `profiles` (profil user & avatar Google)
   - `business_settings` (pengaturan usaha, target omzet/laba, dark mode)
   - `ingredients` (bahan baku & stok)
   - `ingredient_price_history` (riwayat perubahan harga bahan baku)
   - `products` (katalog menu/produk & harga jual)
   - `product_bom_items` (resep Bill of Materials per porsi)
   - `sale_transactions` (riwayat transaksi POS)
   - `cash_flow_entries` (catatan kas masuk/keluar)

---

## Langkah 3: Konfigurasi Email & Password Auth

> **Catatan Lokasi Menu:** Menu **Authentication** berada di **bilah ikon paling kiri** (ikon gembok/user di atas ikon *Settings*), **bukan** di dalam submenu *Project Settings*.

1. Di bilah ikon paling kiri, klik **Authentication**.
2. Pada submenu Authentication di kiri, klik **CONFIGURATION → Sign In / Providers** (atau **Providers**).
3. Klik baris **Email**, pastikan **Enable Email provider** dalam keadaan **ON**.
4. **Untuk pengujian cepat (Development):**
   - Anda bisa mematikan sementara **Confirm email** agar user baru bisa langsung login setelah daftar tanpa verifikasi email.
   - Untuk produksi, biarkan **Confirm email** **ON** (Modal Daftar di aplikasi sudah mendukung pesan konfirmasi email).
5. Klik **Save**.

---

## Langkah 4: Setup Autentikasi Google (Google OAuth 2.0)

Agar tombol **"Lanjutkan dengan Google"** di Modal Login membuka halaman login Google asli:

### A. Catat Callback URL Supabase Anda
Callback URL proyek Anda selalu berformat:
```text
https://<PROJECT_ID>.supabase.co/auth/v1/callback
```
*(Anda juga bisa melihatnya langsung di **Authentication → Sign In / Providers → Google** pada kolom **Callback URL (for OAuth)**.)*

### B. Buat Kredensial OAuth di Google Cloud Console
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat atau pilih proyek (misalnya `HargaPas UMKM`).
3. Buka **APIs & Services → OAuth consent screen**:
   - Pilih **External** → **Create**.
   - Isi **App name** (`HargaPas UMKM`), **User support email**, dan **Developer contact information**.
   - Pada **Scopes**, tambahkan `email`, `profile`, dan `openid`.
   - Jika status masih *Testing*, tambahkan email Gmail Anda ke **Test users** (atau klik **Publish App** agar semua akun Gmail bisa login).
4. Buka **APIs & Services → Credentials → + CREATE CREDENTIALS → OAuth client ID**:
   - **Application type:** `Web application`
   - **Name:** `HargaPas UMKM Web`
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (lokal Vite)
     - `https://domain-anda.vercel.app` (jika sudah deploy produksi)
   - **Authorized redirect URIs:**
     - Masukkan Callback URL Supabase Anda:
       ```text
       https://<PROJECT_ID>.supabase.co/auth/v1/callback
       ```
5. Klik **Create**, lalu salin **Client ID** dan **Client Secret**.

### C. Aktifkan Provider Google di Supabase
1. Kembali ke Supabase Dashboard → **Authentication → Sign In / Providers → Google**.
2. Aktifkan toggle **Enable Sign in with Google**.
3. Tempel **Client ID** dan **Client Secret** dari Google Cloud Console.
4. Klik **Save**.

### D. Atur URL Configuration di Supabase
1. Masih di menu **Authentication**, klik **CONFIGURATION → URL Configuration**.
2. Isi **Site URL**:
   - Lokal: `http://localhost:5173`
   - Produksi: `https://domain-anda.vercel.app`
3. Pada bagian **Redirect URLs**, klik **Add URL** dan tambahkan:
   - `http://localhost:5173`
   - `http://localhost:5173/**`
   - `https://domain-anda.vercel.app/**` (jika sudah deploy)
4. Klik **Save**.

---

## Langkah 5: Konfigurasi File `.env` di Proyek Frontend

1. Pastikan dependensi `@supabase/supabase-js` sudah terpasang (`npm.cmd install`).
2. Duplikat file `.env.example` menjadi `.env` di root folder proyek `HargaKu`:
   ```bash
   copy .env.example .env
   ```
3. Isi `.env` dengan nilai dari Langkah 1:
   ```env
   VITE_SUPABASE_URL=https://<PROJECT_ID>.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_...
   ```
   > **Penting:** File `.env` sudah masuk di `.gitignore` agar API key tidak ter-*push* ke GitHub.
4. *Restart* server development Vite agar `.env` terbaca:
   ```bash
   npm.cmd run dev
   ```

---

## Langkah 6: Pengujian & Verifikasi

1. Buka `http://localhost:5173` di browser.
2. Klik **Masuk / Daftar** atau **Buka Dashboard Aplikasi** untuk membuka **Modal Login**.
3. Uji alur berikut:
   - **Login Google:** Klik **Lanjutkan dengan Google** → pilih akun Gmail → Anda akan diarahkan kembali ke aplikasi dan langsung masuk ke workspace dengan data dari PostgreSQL Supabase.
   - **Daftar Email:** Pilih tab **Daftar Baru**, buat akun usaha baru, lalu cek apakah baris baru muncul di Supabase **Authentication → Users** dan **Table Editor → `profiles`**.
   - **CRUD & Sinkronisasi:** Tambah bahan baku di *Inventaris*, simpan resep di *Kalkulator HPP*, atau catat transaksi di *Kas & POS*, lalu *refresh* halaman (`F5`)—data tetap tersimpan di Supabase.

---

## Troubleshooting Umum

| Masalah | Penyebab Umum | Solusi |
| :--- | :--- | :--- |
| **`Unable to create project under Free Plan`** | Sudah ada 2 project aktif di semua organization akun Anda | **Pause** salah satu project lama di **Settings → General → Pause project** atau keluar dari organization lain yang tidak dipakai. |
| **`redirect_uri_mismatch` saat login Google** | Redirect URI di Google Cloud Console tidak sama persis dengan milik Supabase | Pastikan URI di Google Cloud Console tepat `https://<PROJECT_ID>.supabase.co/auth/v1/callback` tanpa spasi/garis miring ekstra. |
| **Setelah login Google kembali ke halaman awal tapi belum masuk** | `Site URL` atau `Redirect URLs` di Supabase belum mencantumkan `http://localhost:5173` | Tambahkan `http://localhost:5173` dan `http://localhost:5173/**` di **Authentication → URL Configuration**. |
| **Error `new row violates row-level security policy`** | Tabel belum punya policy atau user belum terautentikasi | Pastikan seluruh isi `supabase/schema.sql` sudah dijalankan dan user sudah login. |
| **Aplikasi masih pakai Data Dummy setelah isi `.env`** | Server Vite belum di-*restart* atau nama variabel salah | Pastikan diawali `VITE_` (`VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`) lalu restart `npm.cmd run dev`. |
