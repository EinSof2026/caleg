-- ============================================================
-- MIGRATION: Tambah kolom username ke tabel users
-- Jalankan ini di Supabase SQL Editor sebelum deploy kode baru
-- ============================================================

-- 1. Tambah kolom username (bisa NULL dulu agar tidak blocking)
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Buat unique index supaya tidak ada duplikat username
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- 3. (Opsional) Jika ingin mengisi username dari email untuk user lama:
-- UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL;
