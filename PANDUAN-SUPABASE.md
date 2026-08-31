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
-- Tabel untuk semua pengiriman formulir (aspirasi, relawan, \\\\\\\& daftar akun)
create table if not exists public.submissions (
  id bigint generated always as identity primary key,
  jenis text not null check (jenis in ('aspirasi', 'relawan', 'daftar')),
  data jsonb not null,
  created\\\\\\\_at timestamptz not null default now()
);

-- Aktifkan keamanan baris (Row Level Security)
alter table public.submissions enable row level security;

-- Izinkan pengunjung website MENYIMPAN data (lewat anon key).
-- Membaca data TIDAK diizinkan untuk publik — hanya admin (service role key).
create policy "submissions\\\\\\\_allow\\\\\\\_insert\\\\\\\_anon"
  on public.submissions
  for insert
  to anon
  with check (true);
```

4. Cek hasilnya: buka menu **Table Editor** → seharusnya ada tabel `submissions` (masih kosong).

### Sudah pernah membuat tabel sebelumnya? (penting!)

Jika tabel `submissions` sudah dibuat **sebelum** fitur *Daftar Akun* ada,
constraint-nya masih hanya mengizinkan `'aspirasi'` dan `'relawan'` — akibatnya
formulir **Daftar Akun** gagal tersimpan dengan pesan *"Gagal menyimpan data"*.

Jalankan kode berikut di **SQL Editor** untuk memperbarui constraint-nya:

```sql
alter table public.submissions
  drop constraint submissions\\\_jenis\\\_check;
alter table public.submissions
  add constraint submissions\\\_jenis\\\_check check (jenis in ('aspirasi', 'relawan', 'daftar'));
```

## Langkah 3 — Salin kunci API

1. Di dashboard, buka **Settings** (ikon gerigi, kiri bawah) → **API**.
2. Salin tiga nilai ini ke file **`.env.local`** di proyek:

   * **Project URL** → `NEXT\\\\\\\_PUBLIC\\\\\\\_SUPABASE\\\\\\\_URL`
   * **anon public** → `NEXT\\\\\\\_PUBLIC\\\\\\\_SUPABASE\\\\\\\_ANON\\\\\\\_KEY`
   * **service\_role** → `SUPABASE\\\\\\\_SERVICE\\\\\\\_ROLE\\\\\\\_KEY` (⚠️ kunci ini RAHASIA — jangan pernah dipajang di browser; di proyek ini hanya dipakai di server)

Contoh isi `.env.local`:

```
NEXT\\\\\\\_PUBLIC\\\\\\\_SUPABASE\\\\\\\_URL=https://abcdefgh.supabase.co
NEXT\\\\\\\_PUBLIC\\\\\\\_SUPABASE\\\\\\\_ANON\\\\\\\_KEY=eyJhbGciOi... (panjang)
SUPABASE\\\\\\\_SERVICE\\\\\\\_ROLE\\\\\\\_KEY=eyJhbGciOi... (panjang, berbeda)
ADMIN\\\\\\\_PASSWORD=kata-sandi-admin-rahasia-anda
```

## Langkah 4 — Setel kata sandi admin

Di `.env.local`, ganti nilai `ADMIN\\\\\\\_PASSWORD` dengan kata sandi yang Anda inginkan
untuk membuka halaman admin. Contoh: `ADMIN\\\\\\\_PASSWORD=maruba2029`.

> 💡 Kata sandi ini disimpan di server (file `.env.local`), jadi tidak pernah
> terlihat oleh pengunjung website.

## Langkah 5 — Tes di komputer sendiri

1. Restart server dev: hentikan dengan `Ctrl+C`, lalu jalankan `npm run dev`.
2. Buka `http://localhost:4028`, isi formulir **Titip Aspirasi** dan **Gabung Relawan**.
3. Buka `http://localhost:4028/admin` (atau `http://localhost:4028/#admin`).
4. Masukkan kata sandi admin → semua data yang barusan dikirim harus muncul.

## Langkah 6A — Pasang email kustom (Custom SMTP) supaya kode OTP terkirim ke semua orang

Email bawaan Supabase **tidak bisa dipakai untuk pengunjung umum** — hanya terkirim ke
alamat anggota tim proyek dan dibatasi ±2 email/jam. Untuk website yang sudah dipakai
banyak orang, wajib pasang penyedia email sendiri lewat **Custom SMTP**.

1. Beli nama domain sendiri (mis. `marubasinaga.me`) — subdomain seperti `xxx.vercel.app`
atau `xxx.builtwithrocket.new` **tidak bisa** dipakai karena DNS-nya tidak Anda kelola.
2. Daftar di **https://www.mailersend.com** (gratis, ±100 email/hari) → menu **Email → Domains** →
**Add domain** → isi nama domain Anda → ikuti petunjuk menambah catatan DNS (SPF/DKIM)
di pengelola domain (tempat Anda beli domain) → tunggu verifikasi (biasanya < 1 jam).
3. Di MailerSend: buka domain yang sudah terverifikasi → gulir ke **SMTP** → **Generate new user** →
salin **Username** dan **Password** (password hanya ditampilkan sekali — simpan baik-baik).
SMTP Host: `smtp.mailersend.net`, Port: `587`.
4. Di dashboard Supabase: **Authentication → Email** → bagian **SMTP settings** → aktifkan
**Enable Custom SMTP** → isi:

   * **Host**: `smtp.mailersend.net`
   * **Port**: `587`
   * **User**: Username dari MailerSend
   * **Password**: Password dari MailerSend
   * **From address**: alamat di domain Anda, mis. `noreply@marubasinaga.me`
   * **Sender name**: mis. `Maruba Sinaga`
5. Klik **Save**, lalu tes "Kirim Kode Masuk" di website dengan email apa pun (mis. email teman).

> 💡 Alamat \\\*\\\*From\\\*\\\* harus memakai domain yang sudah terverifikasi di MailerSend.
> Setelah website dipindah ke domain `.me`, perbarui juga \\\*\\\*Site URL\\\*\\\* di
> \\\*\\\*Authentication → URL Configuration\\\*\\\* dan `NEXT\\\_PUBLIC\\\_SITE\\\_URL` di `.env.local`.

## Langkah 6 — Setel di Vercel (untuk situs yang sudah online)

File `.env.local` **tidak ikut ter-deploy** ke Vercel. Anda harus menambahkannya manual:

1. Buka dashboard **Vercel** → proyek *caleg* (suarautara) → **Settings → Environment Variables**.
2. Tambahkan keempat variabel berikut (nilainya sama dengan `.env.local`):

   * `NEXT\\\\\\\_PUBLIC\\\\\\\_SUPABASE\\\\\\\_URL`
   * `NEXT\\\\\\\_PUBLIC\\\\\\\_SUPABASE\\\\\\\_ANON\\\\\\\_KEY`
   * `SUPABASE\\\\\\\_SERVICE\\\\\\\_ROLE\\\\\\\_KEY`
   * `ADMIN\\\\\\\_PASSWORD`
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
|Formulir menolak kirim, pesan "Supabase belum dikonfigurasi"|`NEXT\\\\\\\_PUBLIC\\\\\\\_SUPABASE\\\\\\\_URL` / `SUPABASE\\\\\\\_SERVICE\\\\\\\_ROLE\\\\\\\_KEY` belum diisi di `.env.local`.|
|Formulir menolak kirim, "Gagal menyimpan data"|Cek tabel `submissions` sudah dibuat (SQL Editor) dan nama tabel persis `submissions`. Jika formulir **Daftar Akun** yang gagal: jalankan SQL pembaruan constraint di bagian *Sudah pernah membuat tabel sebelumnya?* di atas.|
|Daftar Akun gagal, pesan "Invalid API key"|Kunci `NEXT\\\_PUBLIC\\\_SUPABASE\\\_ANON\\\_KEY` di environment sudah tidak berlaku (key lama/terganti). Salin ulang kunci **anon public** (atau *publishable key*) yang sekarang dari **Settings → API**, perbarui di `.env.local` (lalu restart `npm run dev`) dan di Vercel → **Settings → Environment Variables**, lalu **Redeploy** (kunci `NEXT\\\_PUBLIC\\\_` terbakar saat build, jadi wajib build ulang).|
|Halaman admin: "ADMIN\_PASSWORD belum diisi"|Isi `ADMIN\\\\\\\_PASSWORD` di `.env.local`, lalu restart `npm run dev`.|
|Data tersimpan tapi tidak muncul di admin|Pastikan Anda login sebagai admin (cookie sesi), lalu muat ulang halaman.|
|Sudah deploy tapi formulir error|Tambahkan keempat env vars di **Vercel → Settings → Environment Variables**, lalu Redeploy.|
|Perubahan `.env.local` tidak berpengaruh|Variabel lingkungan dibaca saat server dinyalakan → restart `npm run dev`.|
|Tidak menerima kode OTP, yang masuk malah email "Confirm your email address"|Pengaturan **Confirm email** di Supabase masih AKTIF. Selama aktif, Supabase mengirim email konfirmasi *menggantikan* kode OTP (itulah mengapa kode 6 angka tidak pernah datang). Matikan: dashboard Supabase → **Authentication → Sign In / Providers → Email** → matikan toggle **Confirm email** → **Save**. Lalu minta kode lagi. Tips: agar email berisi kode 6 angka (sesuai form di website), edit template **Email Templates → Magic link or OTP** dan tambahkan `{{ .Token }}` di isi/subjek email.|
|Klik link di email → "Email link is invalid or has expired"|Token di email itu hanya bisa dipakai sekali dan hangus jika tombol "Kirim kode" ditekan berulang kali (setiap klik mengirim token baru dan menonaktifkan token lama). Setelah **Confirm email** dimatikan (lihat baris di atas), minta kode baru dan gunakan kode 6 angkanya. Jika masih gagal: hapus akun email tersebut di **Authentication → Users**, lalu coba lagi.|
|Link di email mengarah ke `localhost` / tidak ke website|**Site URL** di dashboard Supabase masih bawaan `http://localhost:3000`. Ubah di **Authentication → URL Configuration** → isi **Site URL** dengan alamat website asli (mis. `https://suarautara1702.builtwithrocket.new`), dan tambahkan alamat tersebut ke **Redirect URLs**, lalu **Save**.|
|Tombol "Kirim Kode" gagal, muncul pesan "{}" atau "server email sedang bermasalah"|Server email Supabase menolak mengirim (HTTP 500, pesan asli dari Supabase: *"Error sending magic link email"*). Penyebab paling umum: 1) Template **Authentication → Email Templates → Magic link or OTP** pernah diedit dan ada kesalahan — klik **Reset to default** lalu **Save**; 2) **Custom SMTP** dinyalakan di **Authentication → Email** dengan kredensial salah — periksa Host/Port/User/Password atau matikan Custom SMTP (kembali ke email bawaan); 3) Kuota email bawaan gratis habis (±2 email/jam) — tunggu 1 jam lalu coba lagi. Setelah diperbaiki, klik "Kirim ulang kode".|



