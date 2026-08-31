import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { hashPassword, createSession } from '@/lib/auth';

const SESSION_COOKIE = 'sb_session';

interface RegisterBody {
  nama: string;
  username: string;
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

  const { nama, username, password, usia, alamat } = body;

  // ── Validasi ────────────────────────────────────────────────────
  if (!nama?.trim()) {
    return NextResponse.json({ error: 'Nama lengkap wajib diisi.' }, { status: 400 });
  }
  const usernameNorm = username?.trim().toLowerCase();
  if (!usernameNorm || usernameNorm.length < 3) {
    return NextResponse.json({ error: 'Username minimal 3 karakter.' }, { status: 400 });
  }
  if (!/^[a-z0-9_]+$/.test(usernameNorm)) {
    return NextResponse.json({ error: 'Username hanya boleh huruf kecil, angka, dan underscore.' }, { status: 400 });
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
    .eq('username', usernameNorm)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Username sudah terdaftar. Silakan pilih username lain.' },
      { status: 409 },
    );
  }

  // ── Hash password & simpan ──────────────────────────────────────
  const passwordHash = await hashPassword(password);

  const { data: newUser, error: insertErr } = await supabase
    .from('users')
    .insert({
      email: `${usernameNorm}@placeholder.local`,
      username: usernameNorm,
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
    data: { nama: nama.trim(), username: usernameNorm, usia: String(usiaNum), alamat: alamat.trim() },
  });

  // ── Buat sesi & set cookie ──────────────────────────────────────
  const token = await createSession(newUser.id);
  const res = NextResponse.json({ ok: true, user: { username: usernameNorm, nama: nama.trim() } });
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
