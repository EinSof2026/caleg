import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/adminAuth';

/**
 * Ambil semua data aspirasi & relawan dari Supabase.
 * Hanya bisa diakses kalau cookie sesi admin valid.
 */
export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Tidak diizinkan. Silakan login terlebih dahulu.' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('submissions')
    .select('id, jenis, data, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal membaca dari Supabase:', error.message);
    return NextResponse.json({ error: 'Gagal membaca data dari Supabase.' }, { status: 500 });
  }

  return NextResponse.json({ submissions: data });
}

/** Hapus satu baris data (misalnya data spam) berdasarkan id. */
export async function DELETE(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Tidak diizinkan. Silakan login terlebih dahulu.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Parameter id tidak valid.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('submissions').delete().eq('id', Number(id));

  if (error) {
    console.error('Gagal menghapus dari Supabase:', error.message);
    return NextResponse.json({ error: 'Gagal menghapus data.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
