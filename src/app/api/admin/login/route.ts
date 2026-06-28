import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/admin/login { password } → pose un cookie de session httpOnly.
export async function POST(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'ADMIN_TOKEN non configuré côté serveur' }, { status: 500 });
  }

  let password = '';
  try {
    const body = await req.json();
    password = String(body?.password ?? '');
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  if (password !== token) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 h
  });
  return res;
}
