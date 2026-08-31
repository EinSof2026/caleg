import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Klien Supabase khusus server (hanya dipakai di API route, TIDAK pernah
 * diekspos ke browser). Memakai SUPABASE_SERVICE_ROLE_KEY sehingga bisa
 * membaca & menulis tabel submissions tanpa hambatan Row Level Security.
 *
 * Klien dibuat "malas" (lazy) supaya error yang jelas muncul saat dipakai,
 * bukan saat server dinyalakan.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Pengaturan Supabase belum lengkap. Isi SUPABASE_URL dan SUPABASE_KEY di .env.local.'
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
