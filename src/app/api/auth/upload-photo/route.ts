import { NextResponse } from 'next/server';
import { getSessionTokenFromCookie, validateSession } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

const BUCKET_NAME = 'profile-photos';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  const token = await getSessionTokenFromCookie();
  const user = await validateSession(token);

  if (!user) {
    return NextResponse.json({ error: 'Sesi tidak valid. Silakan masuk kembali.' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });
  }

  const file = formData.get('photo') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'File foto tidak ditemukan.' }, { status: 400 });
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Format foto harus JPEG, PNG, atau WebP.' },
      { status: 400 },
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Ukuran foto maksimal 2 MB.' },
      { status: 400 },
    );
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

  // Generate unique filename
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `avatars/${user.username}-${Date.now()}.${ext}`;

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Upload to Supabase Storage
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadErr) {
    console.error('Gagal upload foto:', uploadErr.message);
    return NextResponse.json(
      { error: 'Gagal mengunggah foto. Coba lagi.' },
      { status: 500 },
    );
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  const publicUrl = urlData.publicUrl;

  // Update user record with photo URL
  const { error: updateErr } = await supabase
    .from('users')
    .update({ foto_profil: publicUrl })
    .eq('id', user.id);

  if (updateErr) {
    console.error('Gagal update foto profil:', updateErr.message);
    return NextResponse.json(
      { error: 'Foto berhasil diunggah, tetapi gagal menyimpan data.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, url: publicUrl });
}
