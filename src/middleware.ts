import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminOnlyPaths } from '@/config/nav-data';

function isProtectedAdminPath(pathname: string): boolean {
  return adminOnlyPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export default function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/access-denied'
  ) {
    return NextResponse.next();
  }

  if (pathname === '/login') {
    if (token) return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.next();
  }

  if (pathname === '/') {
    if (token) return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/dashboard')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));

    if (isProtectedAdminPath(pathname)) {
      const isGlobalAdmin = request.cookies.get('isGlobalAdmin')?.value === 'true';
      if (!isGlobalAdmin) return NextResponse.redirect(new URL('/dashboard/acesso-negado', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
};