import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/auth';

// Protège les pages /admin/* : redirige vers /login si pas de session.
// (La validation réelle du token est faite par les routes /api/admin/*.)
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(ADMIN_COOKIE)?.value);

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
