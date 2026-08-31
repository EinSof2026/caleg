import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Klien Supabase khusus BROWSER (hanya dipakai di komponen client).
 * Memakai NEXT_PUBLIC_SUPABASE_ANON_KEY yang aman diekspos ke browser.
 * Dipakai untuk Auth (login OTP via email) dan sesi pengguna.
 */
export function getSupabaseBrowser(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Pengaturan Supabase belum lengkap. Isi SUPABASE_URL dan SUPABASE_KEY di .env.local.'
    );
  }

  if (!cachedClient) {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cachedClient;
}
