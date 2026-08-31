import { NextResponse } from 'next/server';
import { getSessionTokenFromCookie, validateSession } from '@/lib/auth';

export async function GET() {
  const token = await getSessionTokenFromCookie();
  const user = await validateSession(token);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
