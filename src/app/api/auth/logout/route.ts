import { NextResponse } from 'next/server';
import { getSessionTokenFromCookie, deleteSession } from '@/lib/auth';

const SESSION_COOKIE = 'sb_session';

export async function POST() {
  const token = await getSessionTokenFromCookie();
  if (token) {
    await deleteSession(token).catch(() => {});
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
