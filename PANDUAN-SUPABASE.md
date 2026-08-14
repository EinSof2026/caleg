# PANDUAN SUPABASE — Penyimpanan Data Aspirasi \& Relawan

Panduan langkah demi langkah untuk menyambungkan website ke **Supabase** (database gratis),
sehingga data dari formulir **Titip Aspirasi** dan **Gabung Relawan** tersimpan dan bisa
dilihat pemilik di halaman admin `suarautara.vercel.app/#admin`.

\---

## Gambaran alur

```
Pengunjung isi formulir
   → website kirim ke /api/submit (server Next.js)
   → data disimpan di tabel "submissions" (Supabase)
   → pemilik buka suarautara.vercel.app/#admin → masuk dengan kata sandi → lihat semua data
```

\---

## Langkah 1 — Buat proyek Supabase

1. Buka **https://supabase.com** → klik **Start your project** → daftar/masuk (bisa pakai akun GitHub).
2. Klik **New project**.
3. Isi:

   * **Name**: `suarautara`
   * **Database Password**: buat kata sandi kuat (catat baik-baik — ini untuk database, bukan untuk admin) --> yosafat260409
   * **Region**: pilih yang terdekat (mis. `Singapore`)
4. Klik **Create new project** dan tunggu beberapa menit sampai selesai.

## Langkah 2 — Buat tabel

1. Di dashboard proyek, buka menu **SQL Editor** (di sidebar kiri).
2. Klik **New query**.
3. Tempel kode di bawah ini, lalu klik **Run**:

```sql
-- Tabel untuk semua pengiriman formulir (aspirasi \& relawan)
create table if not exists public.submissions (
  id bigint generated always as identity primary key,
  jenis text not null check (jenis in ('aspirasi', 'relawan')),
  data jsonb not null,
  created\_at timestamptz not null default now()
);

-- Aktifkan keamanan baris (Row Level Security)
alter table public.submissions enable row level security;

-- Izinkan pengunjung website MENYIMPAN data (lewat anon key).
-- Membaca data TIDAK diizinkan untuk publik — hanya admin (service role key).
create policy "submissions\_allow\_insert\_anon"
  on public.submissions
  for insert
  to anon
  with check (true);
```

4. Cek hasilnya: buka menu **Table Editor** → seharusnya ada tabel `submissions` (masih kosong).

## Langkah 3 — Salin kunci API

1. Di dashboard, buka **Settings** (ikon gerigi, kiri bawah) → **API**.
2. Salin tiga nilai ini ke file **`.env.local`** di proyek:

   * **Project URL** → `NEXT\_PUBLIC\_SUPABASE\_URL`
   * **anon public** → `NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY`
   * **service\_role** → `SUPABASE\_SERVICE\_ROLE\_KEY` (⚠️ kunci ini RAHASIA — jangan pernah dipajang di browser; di proyek ini hanya dipakai di server)

Contoh isi `.env.local`:

```
NEXT\_PUBLIC\_SUPABASE\_URL=https://abcdefgh.supabase.co
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=eyJhbGciOi... (panjang)
SUPABASE\_SERVICE\_ROLE\_KEY=eyJhbGciOi... (panjang, berbeda)
ADMIN\_PASSWORD=kata-sandi-admin-rahasia-anda
```

## Langkah 4 — Setel kata sandi admin

Di `.env.local`, ganti nilai `ADMIN\_PASSWORD` dengan kata sandi yang Anda inginkan
untuk membuka halaman admin. Contoh: `ADMIN\_PASSWORD=maruba2029`.

> 💡 Kata sandi ini disimpan di server (file `.env.local`), jadi tidak pernah
> terlihat oleh pengunjung website.

## Langkah 5 — Tes di komputer sendiri

1. Restart server dev: hentikan dengan `Ctrl+C`, lalu jalankan `npm run dev`.
2. Buka `http://localhost:4028`, isi formulir **Titip Aspirasi** dan **Gabung Relawan**.
3. Buka `http://localhost:4028/admin` (atau `http://localhost:4028/#admin`).
4. Masukkan kata sandi admin → semua data yang barusan dikirim harus muncul.

## Langkah 6 — Setel di Vercel (untuk situs yang sudah online)

File `.env.local` **tidak ikut ter-deploy** ke Vercel. Anda harus menambahkannya manual:

1. Buka dashboard **Vercel** → proyek *caleg* (suarautara) → **Settings → Environment Variables**.
2. Tambahkan keempat variabel berikut (nilainya sama dengan `.env.local`):

   * `NEXT\_PUBLIC\_SUPABASE\_URL`
   * `NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY`
   * `SUPABASE\_SERVICE\_ROLE\_KEY`
   * `ADMIN\_PASSWORD`
3. Klik **Deployments** → **Redeploy** agar perubahan diterapkan.

\---

## Mengakses halaman admin

|Cara|URL|
|-|-|
|Langsung|`https://suarautara.vercel.app/admin`|
|Seperti yang Anda minta|`https://suarautara.vercel.app/#admin` (otomatis diarahkan ke `/admin`)|

\---

## Yang bisa dilakukan di halaman admin

* **Melihat statistik**: total masuk, jumlah aspirasi, jumlah relawan.
* **Menyaring data**: tab *Semua*, *Aspirasi*, *Relawan*.
* **Menghubungi pengirim**: nomor WhatsApp pengirim bisa diklik (membuka chat di perangkat Anda).
* **Menghapus data**: misalnya data spam (ikon tempat sampah di pojok kartu).
* **Keluar**: tombol *Keluar* di pojok kanan atas.

Sesi login berlaku **12 jam**, lalu otomatis diminta login lagi.

\---

## Pemecahan masalah

|Masalah|Penyebab \& solusi|
|-|-|
|Formulir menolak kirim, pesan "Supabase belum dikonfigurasi"|`NEXT\_PUBLIC\_SUPABASE\_URL` / `SUPABASE\_SERVICE\_ROLE\_KEY` belum diisi di `.env.local`.|
|Formulir menolak kirim, "Gagal menyimpan data"|Cek tabel `submissions` sudah dibuat (SQL Editor) dan nama tabel persis `submissions`.|
|Halaman admin: "ADMIN\_PASSWORD belum diisi"|Isi `ADMIN\_PASSWORD` di `.env.local`, lalu restart `npm run dev`.|
|Data tersimpan tapi tidak muncul di admin|Pastikan Anda login sebagai admin (cookie sesi), lalu muat ulang halaman.|
|Sudah deploy tapi formulir error|Tambahkan keempat env vars di **Vercel → Settings → Environment Variables**, lalu Redeploy.|
|Perubahan `.env.local` tidak berpengaruh|Variabel lingkungan dibaca saat server dinyalakan → restart `npm run dev`.|



