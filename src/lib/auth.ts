import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from './supabase';

const SESSION_COOKIE = 'sb_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ── Password hashing ──────────────────────────────────────────────

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// ── Session helpers ───────────────────────────────────────────────

/** Generate a random session token and persist it in Supabase `user_sessions` table. */
export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('user_sessions')
    .insert({ user_id: userId, token, expires_at: expiresAt });

  if (error) throw new Error('Gagal membuat sesi: ' + error.message);
  return token;
}

/** Validate a session token: returns the user row or null. */
export async function validateSession(token: string | undefined): Promise<{
  id: number;
  username: string;
  nama: string;
  usia: string;
  alamat: string;
  foto_profil: string | null;
} | null> {
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('user_sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (error || !data) return null;

  // Check expiry
  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('user_sessions').delete().eq('token', token);
    return null;
  }

  // Fetch user
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('id, username, nama, usia, alamat, foto_profil')
    .eq('id', data.user_id)
    .single();

  if (userErr || !user) return null;
  return user;
}

/** Delete a session (logout). */
export async function deleteSession(token: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from('user_sessions').delete().eq('token', token);
}

// ── Cookie helpers (server-side) ──────────────────────────────────

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function getSessionTokenFromCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

// ── Combined helpers ──────────────────────────────────────────────

export async function getCurrentUser() {
  const token = await getSessionTokenFromCookie();
  return validateSession(token);
}
