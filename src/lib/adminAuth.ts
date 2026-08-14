import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 12 * 60 * 60; // 12 jam dalam detik

/**
 * Membuat token sesi bertanda tangan HMAC-SHA256.
 * Isinya hanya timestamp pembuatan; tanda tangannya memakai kata sandi admin
 * sebagai kunci, jadi token tidak bisa dipalsukan tanpa tahu kata sandinya.
 */
export function createSessionToken(secret: string): string {
  const payload = String(Date.now());
  const signature = createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Memeriksa cookie sesi admin di request yang masuk.
 * Mengembalikan true hanya jika tanda tangan valid DAN sesi belum lewat 12 jam.
 */
export async function verifyAdminSession(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = createHmac('sha256', password).update(payload).digest('hex');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);

  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return false;

  const issuedAt = Number(payload);
  if (Number.isNaN(issuedAt) || Date.now() - issuedAt > SESSION_MAX_AGE * 1000) return false;

  return true;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_SESSION_MAX_AGE = SESSION_MAX_AGE;
