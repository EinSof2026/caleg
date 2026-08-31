import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyPassword, createSession } from '@/lib/auth';

const SESSION_COOKIE = 'sb_session';

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email tidak valid.' }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: 'Password wajib diisi.' }, { status: 400 });
  }

  // ── Cari user ───────────────────────────────────────────────────
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Supabase belum dikonfigurasi.' },
      { status: 500 },
    );
  }

  const { data: user, error: queryErr } = await supabase
    .from('users')
    .select('id, email, nama, password_hash')
    .eq('email', email)
    .single();

  if (queryErr || !user) {
    return NextResponse.json(
      { error: 'Email atau password salah.' },
      { status: 401 },
    );
  }

  // ── Verifikasi password ─────────────────────────────────────────
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return NextResponse.json(
      { error: 'Email atau password salah.' },
      { status: 401 },
    );
  }

  // ── Buat sesi ───────────────────────────────────────────────────
  const token = await createSession(user.id);

  const res = NextResponse.json({
    ok: true,
    user: { email: user.email, nama: user.nama },
  });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return res;
}
