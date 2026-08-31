import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { hashPassword, createSession, setSessionCookie } from '@/lib/auth';

interface RegisterBody {
  nama: string;
  email: string;
  password: string;
  usia: string;
  alamat: string;
}

export async function POST(request: Request) {
  let body: RegisterBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });
  }

  const { nama, email, password, usia, alamat } = body;

  // ── Validasi ────────────────────────────────────────────────────
  if (!nama?.trim()) {
    return NextResponse.json({ error: 'Nama lengkap wajib diisi.' }, { status: 400 });
  }
  const emailNorm = email?.trim().toLowerCase();
  if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    return NextResponse.json({ error: 'Email wajib diisi dengan alamat yang valid.' }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });
  }
  const usiaNum = Number(usia);
  if (!usia || !Number.isInteger(usiaNum) || usiaNum < 1 || usiaNum > 120) {
    return NextResponse.json({ error: 'Usia harus antara 1–120.' }, { status: 400 });
  }
  if (!alamat?.trim()) {
    return NextResponse.json({ error: 'Alamat wajib diisi.' }, { status: 400 });
  }

  // ── Cek duplikat ────────────────────────────────────────────────
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Supabase belum dikonfigurasi.' },
      { status: 500 },
    );
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', emailNorm)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Email sudah terdaftar. Silakan masuk.' },
      { status: 409 },
    );
  }

  // ── Hash password & simpan ──────────────────────────────────────
  const passwordHash = await hashPassword(password);

  const { data: newUser, error: insertErr } = await supabase
    .from('users')
    .insert({
      email: emailNorm,
      password_hash: passwordHash,
      nama: nama.trim(),
      usia: String(usiaNum),
      alamat: alamat.trim(),
    })
    .select('id')
    .single();

  if (insertErr) {
    console.error('Gagal menyimpan user:', insertErr.message);
    return NextResponse.json(
      { error: 'Gagal menyimpan data. Coba lagi.' },
      { status: 500 },
    );
  }

  // ── Simpan juga ke submissions agar admin bisa melihat ───────────
  await supabase.from('submissions').insert({
    jenis: 'daftar',
    data: { nama: nama.trim(), email: emailNorm, usia: String(usiaNum), alamat: alamat.trim() },
  });

  // ── Buat sesi & set cookie ──────────────────────────────────────
  const token = await createSession(newUser.id);
  const res = NextResponse.json({ ok: true, user: { email: emailNorm, nama: nama.trim() } });
  // Set cookie on the response
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return res;
}

const SESSION_COOKIE = 'sb_session';
