# PANDUAN N8N — AI Asisten di Telegram

Panduan langkah demi langkah untuk menyambungkan **n8n** agar melayani pengunjung yang
menekan tombol **"Hubungi AI Asisten"** di website `suarautara.vercel.app`.

\---

## Arsitektur yang benar

```
JALUR 1 — Formulir (Titip Aspirasi / Gabung Relawan)
   website → /api/submit → Supabase (tabel submissions)
   Pemilik melihat datanya di halaman admin: suarautara.vercel.app/#admin
   ❌ n8n TIDAK terlibat di jalur ini.

JALUR 2 — Percakapan user ↔ AI (di Telegram)
   User klik tombol "Hubungi AI Asisten" di website
     → membuka bot Telegram (https://t.me/marubasinaga\_bot)
     → n8n (Telegram Trigger) menerima pesan
     → AI/LLM menyusun jawaban
     → n8n membalas user di Telegram
```

Aturan penting:

* **n8n hanya dipakai untuk melayani percakapan AI di Telegram.**
* WhatsApp **tidak dipakai sama sekali** di website ini.
* Percakapan **selalu dimulai oleh user** (user menekan tombol di website lalu menulis
ke bot). Bot tidak bisa menghubungi user lebih dulu.

\---

## Langkah 1 — Siapkan bot Telegram (kalau belum)

1. Buka Telegram, cari **@BotFather**.
2. Ketik `/newbot`, ikuti petunjuknya (nama bot, lalu username, mis. `marubasinaga\_bot`).
3. BotFather akan memberi **token** (kode rahasia panjang). Simpan baik-baik.

## Langkah 2 — Buat workflow di n8n

1. Buka n8n Anda → **Workflows** → **Add workflow** → beri nama, mis. *AI Asisten Telegram*.
2. Tambahkan node **Telegram Trigger** (kategori *Trigger*):

   * Klik kanan area kosong → *Add Node* → cari `Telegram Trigger`.
   * Pada **Credential to connect with**: pilih *Create new* → masukkan token dari BotFather.
   * **Update**: pilih `message`.
3. Tambahkan node **AI Agent** (atau **OpenAI / Claude** — sesuaikan model yang Anda pakai):

   * Hubungkan dari Telegram Trigger.
   * Buat **System Prompt** berisi kepribadian AI asisten:

> Kamu adalah AI asisten resmi Maruba Sinaga, calon Anggota DPD RI Sumatera Utara 2029.
     > Jawab pertanyaan seputar visi misi, program, dan cara bergabung sebagai relawan
     > dengan ramah dan informatif dalam Bahasa Indonesia.

4. Tambahkan node **Telegram** (aksi *Send Message*):

   * Hubungkan dari AI Agent.
   * **Chat ID**: pilih `From Telegram Trigger` (otomatis memakai chat id pengirim).
   * **Text**: hasil jawaban AI (mis. `{{ $json.output }}` — sesuaikan nama field keluaran AI Anda).
5. Klik **Active** (toggle di kanan atas) agar workflow berjalan.

## Langkah 3 — Pastikan link bot sudah benar

Tombol **"Hubungi AI Asisten"** di website memakai nilai dari `.env.local`:

```
NEXT\_PUBLIC\_TELEGRAM\_BOT\_URL=https://t.me/marubasinaga\_bot
```

Bot Anda sudah benar. Kalau suatu saat ganti bot, cukup ubah baris ini, lalu
restart `npm run dev` (atau perbarui juga di Vercel → Environment Variables → Redeploy).

## Langkah 4 — Tes

1. Buka `http://localhost:4028` → klik tombol **Hubungi AI Asisten**.
2. Di Telegram, kirim pesan ke bot, mis. *"Halo, apa program prioritasmu?"*.
3. Di n8n, buka tab **Executions** — harusnya ada eksekusi yang sukses, dan bot membalas.
4. Kalau sudah jalan di lokal, pastikan nilai `NEXT\_PUBLIC\_TELEGRAM\_BOT\_URL`
juga ada di **Vercel → Settings → Environment Variables**, lalu Redeploy.

\---

## Pemecahan masalah

|Masalah|Penyebab \& solusi|
|-|-|
|Bot tidak membalas|Cek toggle **Active** di workflow n8n; cek tab Executions untuk error.|
|"Chat not found" / 400 di Telegram node|Chat ID salah. Pilih field dari Telegram Trigger, atau kirim dulu satu pesan ke bot agar ada chat.|
|Token tidak diterima n8n|Salin ulang token dari @BotFather tanpa spasi; buat credential baru.|
|Tombol membuka bot yang salah|Periksa `NEXT\_PUBLIC\_TELEGRAM\_BOT\_URL` di `.env.local` (lokal) dan Vercel (produksi).|
|Pengguna bertanya di luar topik|Perkuat System Prompt di node AI Agent.|



