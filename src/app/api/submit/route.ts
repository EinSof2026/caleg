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

type SubmitBody =
  | { jenis: 'aspirasi'; data: AspirasiPayload }
  | { jenis: 'relawan'; data: RelawanPayload };

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
  if (!body || (body.jenis !== 'aspirasi' && body.jenis !== 'relawan')) {
    return NextResponse.json({ error: 'Jenis pengiriman tidak dikenali.' }, { status: 400 });
  }

  const { jenis, data } = body;
  if (!data || !data.nama || !data.whatsapp || !data.kabupaten) {
    return NextResponse.json({ error: 'Data tidak lengkap. Nama, WhatsApp, dan Kabupaten/Kota wajib diisi.' }, { status: 400 });
  }
  if (jenis === 'aspirasi' && (!(data as AspirasiPayload).kategori || !(data as AspirasiPayload).pesan)) {
    return NextResponse.json({ error: 'Data aspirasi tidak lengkap. Kategori dan pesan wajib diisi.' }, { status: 400 });
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
