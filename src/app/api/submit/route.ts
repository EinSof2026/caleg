import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

interface AspirasiPayload {
  nama: string;
  whatsapp: string;
  kabupaten: string;
  kecamatan?: string;
  kategori: string;
  pesan: string;
}

interface RelawanPayload {
  nama: string;
  whatsapp: string;
  kabupaten: string;
  email?: string;
  motivasi?: string;
}

interface DaftarPayload {
  nama: string;
  email: string;
  usia: string;
  alamat: string;
}

type SubmitBody =
  | { jenis: 'aspirasi'; data: AspirasiPayload }
  | { jenis: 'relawan'; data: RelawanPayload }
  | { jenis: 'daftar'; data: DaftarPayload };

/**
 * Alur: browser -> /api/submit (server Next.js) -> tabel `submissions` di Supabase
 * Data kemudian bisa dilihat pemilik di halaman admin (/admin).
 */
export async function POST(request: Request) {
  // 1. Baca dan cek JSON dari browser
  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Data yang dikirim bukan JSON yang valid.' }, { status: 400 });
  }

  // 2. Validasi dasar
  if (!body || (body.jenis !== 'aspirasi' && body.jenis !== 'relawan' && body.jenis !== 'daftar')) {
    return NextResponse.json({ error: 'Jenis pengiriman tidak dikenali.' }, { status: 400 });
  }

  const { jenis, data } = body;
  if (!data || !data.nama) {
    return NextResponse.json({ error: 'Nama wajib diisi.' }, { status: 400 });
  }
  if (jenis === 'aspirasi') {
    const d = data as AspirasiPayload;
    if (!d.whatsapp || !d.kabupaten) {
      return NextResponse.json({ error: 'Data aspirasi tidak lengkap. WhatsApp dan Kabupaten/Kota wajib diisi.' }, { status: 400 });
    }
    if (!d.kategori || !d.pesan) {
      return NextResponse.json({ error: 'Data aspirasi tidak lengkap. Kategori dan pesan wajib diisi.' }, { status: 400 });
    }
  } else if (jenis === 'relawan') {
    const d = data as RelawanPayload;
    if (!d.whatsapp || !d.kabupaten) {
      return NextResponse.json({ error: 'Data relawan tidak lengkap. WhatsApp dan Kabupaten/Kota wajib diisi.' }, { status: 400 });
    }
  } else {
    const d = data as DaftarPayload;
    if (!d.email) {
      return NextResponse.json({ error: 'Data pendaftaran tidak lengkap. Email wajib diisi.' }, { status: 400 });
    }
    if (!d.usia || !d.alamat) {
      return NextResponse.json({ error: 'Data pendaftaran tidak lengkap. Usia dan alamat wajib diisi.' }, { status: 400 });
    }
  }

  // 3. Simpan ke Supabase (tabel submissions)
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Supabase belum dikonfigurasi.' },
      { status: 500 }
    );
  }

  const { error } = await supabase.from('submissions').insert({ jenis, data });

  if (error) {
    console.error('Gagal menyimpan ke Supabase:', error.message);
    return NextResponse.json(
      { error: 'Gagal menyimpan data. Coba lagi sebentar lagi.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
