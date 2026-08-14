import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE, createSessionToken } from '@/lib/adminAuth';

/**
 * Login admin: membandingkan kata sandi dengan ADMIN_PASSWORD di .env.local.
 * Kalau cocok, set cookie sesi httpOnly yang bertanda tangan HMAC.
 */
export async function POST(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD belum diisi di .env.local (lihat PANDUAN-SUPABASE.md).' },
      { status: 500 }
    );
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });
  }

  if (typeof password !== 'string' || password !== expected) {
    return NextResponse.json({ error: 'Kata sandi salah.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, createSessionToken(expected), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return response;
}
