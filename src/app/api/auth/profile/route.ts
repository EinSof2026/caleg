import { NextResponse } from 'next/server';
import { getSessionTokenFromCookie, validateSession } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

interface ProfileBody {
  nama?: string;
  usia?: string;
  alamat?: string;
  foto_profil?: string | null;
}

export async function PUT(request: Request) {
  const token = await getSessionTokenFromCookie();
  const user = await validateSession(token);

  if (!user) {
    return NextResponse.json({ error: 'Sesi tidak valid. Silakan masuk kembali.' }, { status: 401 });
  }

  let body: ProfileBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });
  }

  const updates: Record<string, string | null> = {};

  // Validate and prepare updates
  if (body.nama !== undefined) {
    const nama = body.nama.trim();
    if (!nama) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi.' }, { status: 400 });
    }
    updates.nama = nama;
  }

  if (body.usia !== undefined) {
    const usiaNum = Number(body.usia);
    if (!body.usia || !Number.isInteger(usiaNum) || usiaNum < 1 || usiaNum > 120) {
      return NextResponse.json({ error: 'Usia harus antara 1–120.' }, { status: 400 });
    }
    updates.usia = String(usiaNum);
  }

  if (body.alamat !== undefined) {
    const alamat = body.alamat.trim();
    if (!alamat) {
      return NextResponse.json({ error: 'Alamat wajib diisi.' }, { status: 400 });
    }
    updates.alamat = alamat;
  }

  if (body.foto_profil !== undefined) {
    updates.foto_profil = body.foto_profil || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Tidak ada data yang diubah.' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Supabase belum dikonfigurasi.' },
      { status: 500 },
    );
  }

  const { error: updateErr } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id);

  if (updateErr) {
    console.error('Gagal update profile:', updateErr.message);
    return NextResponse.json(
      { error: 'Gagal menyimpan perubahan. Coba lagi.' },
      { status: 500 },
    );
  }

  // Return updated user data
  const updatedUser = {
    ...user,
    ...updates,
  };

  return NextResponse.json({ ok: true, user: updatedUser });
}
