# CATATAN PROYEK & LANJUTAN

> **Baca file ini dulu di setiap sesi baru.** Isinya konteks lengkap proyek, status
> terakhir, dan langkah berikutnya — supaya tidak perlu dijelaskan ulang dari awal.

---

## 1. Apa proyek ini

- **Website kampanye "Suara Utara" — Maruba Sinaga, Caleg DPD RI, Dapil Sumatera Utara 2029.**
- Tujuan: menjadi wadah aspirasi warga Sumatera Utara, rekrutmen relawan, dan
  penghimpunan pendukung (akun pendaftar) — plus dashboard admin untuk pengelolaan.

## 2. Teknologi & struktur

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS** (PWA via next-pwa).
- **Supabase**: auth (login OTP via email) + tabel `submissions` (data formulir).
- Deploy: Vercel (domain saat ini masih subdomain platform: `marubasinaga.vercel.app` /
  `suarautara1702.builtwithrocket.new`).

## 3. Fitur yang sudah ada

| Fitur | Lokasi |
|-|-|
| Beranda, Profil (timeline), Fokus Sumut, Peta Aspirasi (peta Sumut), Galeri | halaman utama |
| Form **Titip Aspirasi** & **Gabung Relawan** | `src/app/components/AspirasiForm.tsx` |
| Form **Daftar Akun** + modal **Masuk/Daftar** (login OTP email) | `src/app/components/AuthModal.tsx` |
| Penyimpanan formulir → Supabase tabel `submissions` (`jenis`: `aspirasi` / `relawan` / `daftar`) | `src/app/api/submit/route.ts` |
| **Panel Admin** `/admin`: statistik, tab Aspirasi/Relawan/Daftar, hapus data, sesi 12 jam | `src/app/admin/page.tsx` |

## 4. Status terakhir (31 Agustus 2026 — update jam 12:30)

- ✅ **Bug `{}` di modal Login/Daftar diperbaiki** (`AuthModal.tsx`, fungsi `readableAuthError`):
  penyebabnya server email Supabase menolak kirim (HTTP 500 `"Error sending magic link email"`),
  dan supabase-js menampilkan pesan mentah `"{}"`. Sekarang muncul pesan ramah.
  Typecheck (`npx tsc --noEmit`) lolos.
- ✅ **Confirm email di Supabase dimatikan** (`mailer_autoconfirm: true`).
- ✅ **Venv bot Telegram difix** — Packages terinstall di venv (groq v1.7.0, dll)
- ✅ **Supabase error handling** — `start_command` di-wrap dengan try/except, bot tetap jalan walau Supabase down
- ✅ **Robust error handling** — `to_telegram_markdown` handle None/error, `handle_text` fallback plain text, `lead.py` handle empty Groq response
- ✅ **Update .env.example** — Dari Gemini ke Groq
- ⚠️ **Email OTP belum terkirim ke pengunjung umum.** Email bawaan Supabase hanya
  mengirim ke alamat anggota tim proyek & dibatasi ±2 email/jam → **wajib Custom SMTP**.

## 5. Arah & tujuan pengembangan selanjutnya

**Segera (prioritas):**
1. Beli **domain `.me`** sendiri (mis. `marubasinaga.me`) — subdomain `vercel.app` /
   `builtwithrocket.new` **tidak bisa** dipakai untuk verifikasi domain MailerSend.
2. **MailerSend** (akun sudah dibuat): **Email → Domains → Add domain** → tambah DNS
   SPF/DKIM di pengelola domain → tunggu verifikasi.
3. **MailerSend → SMTP → Generate new user** → salin **Username & Password** (sekali muncul).
4. **Supabase → Authentication → Email → SMTP settings** → Enable Custom SMTP:
   Host `smtp.mailersend.net` · Port `587` · User/Password MailerSend ·
   From `noreply@<domain>` · Sender name `Maruba Sinaga` → **Save**.
5. Tes "Kirim Kode Masuk" dengan email publik (mis. email teman).
6. Setelah website dipindah ke domain `.me`: set **Site URL & Redirect URLs** di Supabase,
   `NEXT_PUBLIC_SITE_URL` di `.env.local`, dan Environment Variables + Redeploy di Vercel.

---

## 6. 🤖 PROYEK BARU: AI Asisten Telegram (Maruba Sinaga Bot)

### 6.1 Apa ini

Bot Telegram AI yang menjawab pertanyaan tentang Maruba Sinaga, Calon Anggota DPD RI
Dapil Sumatera Utara 2029. Pengguna website menekan tombol **"Hubungi AI Asisten"**
→ dibuka Telegram → chat langsung dengan AI.

### 6.2 Lokasi project

```
C:\Users\YOSAFAT J. HUTAURUK\Downloads\caleg\mentor_bahasa_inggris_virtual\
```

Project ini **asalnya** adalah bot "Mentor Bahasa Inggris Virtual" yang sudah diubah
menjadi "AI Asisten Maruba Sinaga".

### 6.3 Tech Stack

| Komponen | Teknologi | Status |
|----------|-----------|--------|
| LLM (AI) | **Groq** (Qwen 3.6 27B) | ✅ Terhubung, gratis |
| Bot Framework | python-telegram-bot | ✅ Terinstall |
| Database | Supabase (chat history) | ⚠️ Opsional (network issue) |
| Bahasa | Python | ✅ |

### 6.4 File yang sudah diubah

| File | Perubahan |
|------|-----------|
| `.env` | ✅ Ditambah `GROQ_API_KEY` & `GROQ_MODEL=qwen/qwen3.6-27b` |
| `src/core/env.py` | ✅ Diganti dari Gemini ke Groq vars |
| `src/core/llm.py` | ✅ Diganti dari `google.genai` ke `groq.Groq` |
| `src/core/prompts.py` | ✅ Diperbaiki cache (auto-refresh saat file berubah) |
| `src/agents/instructions/agent-lead.md` | ✅ System prompt baru untuk Maruba Sinaga |
| `src/agents/lead.py` | ✅ Simplify: pakai Groq, Supabase opsional, strip thinking tags |
| `src/agents/services.py` | ✅ Dikosongkan (tidak dipakai) |
| `src/app.py` | ✅ Welcome message baru, hapus voice/report handlers |
| `src/app_cli.py` | ✅ Updated text CLI |
| `requirements.txt` | ✅ Updated dependencies |
| `README.md` | ✅ Updated dokumentasi |
| 8 instruction files | ✅ Dihapus (hanya sisakan `agent-lead.md`) |

### 6.5 API Keys

| Key | Nilai | Status |
|-----|-------|--------|
| `GROQ_API_KEY` | `gsk_REDACTED` | ✅ Aktif |
| `GROQ_MODEL` | `qwen/qwen3.6-27b` | ✅ Gratis, 30 req/menit |
| `TELEGRAM_BOT_TOKEN` | `8972606540:AAG6DI8H0ajYgLPGjaicwIsyAIMIG1z_O1E` | ✅ Bot: @marubasinaga_bot |
| `SUPABASE_URL` | `https://kqifimsqvuyugjzersej.supabase.co` | ⚠️ Network issue dari sini |

### 6.6 Masalah yang belum terselesaikan

#### ✅ FIXED: Bot tidak bisa dijalankan dari PowerShell

**Masalah lama:** Virtual environment (`.venv`) punya Python terisolasi. Package `groq` terinstall
di Python **global**, tapi bot pakai Python **venv**.

**Solusi yang sudah dilakukan (31 Agustus 2026):**
1. Install pip ke venv: `python -m ensurepip`
2. Install semua packages ke venv: `pip install groq python-telegram-bot supabase loguru python-dotenv pydantic telegramify-markdown tzdata`
3. Semua packages terinstall di `.venv` dengan groq v1.7.0

**✅ Bot sekarang bisa dijalankan:**
```powershell
cd "C:\Users\YOSAFAT J. HUTAURUK\Downloads\caleg\mentor_bahasa_inggris_virtual"
& ".venv\Scripts\python.exe" main.py --telegram
```

#### ✅ FIXED: Supabase crash saat tidak bisa diakses

**Masalah lama:** `start_command` di `app.py` memanggil `chat_repository.save_user()` tanpa
try/except → bot crash kalau Supabase tidak bisa diakses.

**Solusi (31 Agustus 2026):** Wrap `save_user()` dalam try/except di `app.py`.
Sekarang bot tetap jalan walau Supabase down. Chat history tidak tersimpan tapi bot tetap merespons.

**Catatan:** `lead.py` sudah punya error handling untuk `_load_history` dan `_save_message`.
Hanya `start_command` yang belum di-wrap.

### 6.7 Cara Jalankan Bot (Lengkap)

```powershell
cd "C:\Users\YOSAFAT J. HUTAURUK\Downloads\caleg\mentor_bahasa_inggris_virtual"

# Install package ke venv (sekali saja)
& ".venv\Scripts\pip.exe" install groq python-telegram-bot supabase loguru python-dotenv pydantic telegramify-markdown tzdata

# Jalankan bot
& ".venv\Scripts\python.exe" main.py --telegram
```

### 6.8 Yang Sudah Berhasil Dites

- ✅ Groq API terhubung, AI merespons dengan benar tentang Maruba Sinaga
- ✅ System prompt terload dengan info lengkap (5 Fokus Perjuangan, 33 Kab/Kota, dll)
- ✅ Thinking tags Qwen berhasil di-strip dari response
- ✅ Bot token valid (@marubasinaga_bot)
- ✅ CLI mode (`python main.py`) berfungsi
- ✅ **Telegram bot bisa dijalankan** — terhubung ke Telegram, menerima `/start` dari user
- ✅ **Supabase error di-handle gracefully** — bot tetap jalan walau Supabase down
- ✅ **Semua packages terinstall di venv** — groq, python-telegram-bot, supabase, dll

### 6.9 Langkah Selanjutnya (PRIORITAS)

1. ~~**Fix venv issue**~~ ✅ DONE (31 Agustus 2026)
2. ~~**Jalankan bot**~~ ✅ DONE — bot terhubung ke Telegram
3. ~~**Test di Telegram**~~ ✅ DONE — `/start` berhasil, pesan biasa masih perlu dicek (error handling sudah di-improve)
4. **Re-test pesan biasa** — Kirim pertanyaan ke bot untuk pastikan Groq API jalan dari komputer user
5. **Deploy 24/7** — Deploy ke Render.com/Railway agar bot aktif terus
6. **Hubungkan ke website** — Tombol "Hubungi AI Asisten" sudah mengarah ke @marubasinaga_bot
7. **Fix SMTP** — Custom SMTP untuk email OTP login (website kampanye)

---

## 7. Dokumen pendukung

- **`PANDUAN-SUPABASE.md`** — panduan lengkap Supabase, termasuk **Langkah 6A (Custom SMTP)**
  dan tabel Pemecahan masalah (baris tentang `{}` / server email).
- **`PANDUAN-N8N.md`** — panduan workflow n8n untuk AI Telegram (tidak dipakai, sudah pakai Groq langsung).

## 8. Data uji yang perlu dibersihkan

- Halaman admin: baris **"QA Test"** (hapus lewat ikon sampah).
- Supabase → **Authentication → Users**: akun **`qa-test-otp@example.com`** (hapus).

## 9. Cara melanjutkan di sesi berikutnya

Mulai percakapan baru dengan: **"Lanjutkan dari CATATAN-LANJUTAN.md"** — asisten membaca
file ini dan langsung tahu konteks, status, dan langkah berikutnya.

**Fokus sesi berikutnya: Re-test pesan biasa di Telegram → Deploy 24/7 → Hubungkan ke website → Fix SMTP.**
