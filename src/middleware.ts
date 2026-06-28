import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/auth';

// Protège les pages /admin/* : redirige vers /admin/login si pas de session.
// (La validation réelle du token est faite par les routes /api/admin/*.)
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === '/admin/login';
  const hasSession = Boolean(req.cookies.get(ADMIN_COOKIE)?.value);

  if (!isLogin && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Déjà connecté et sur la page login → vers le dashboard.
  if (isLogin && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
