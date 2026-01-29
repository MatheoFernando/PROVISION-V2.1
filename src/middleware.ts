import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { globalAdminAllowedPaths } from '@/config/nav-data';

function isAccessDeniedForGlobalAdmin(pathname: string, isGlobalAdmin: boolean): boolean {
  if (!isGlobalAdmin) return false;
  
  // Dashboard principal é acessível para todos
  if (pathname === '/dashboard') return false;
  
  // Verifica se a rota está na allowlist
  const isAllowed = globalAdminAllowedPaths.some(
    (allowedPath) => pathname === allowedPath || pathname.startsWith(allowedPath + '/')
  );
  
  // Se não estiver na allowlist, bloqueia
  return !isAllowed;
}

export default function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isGlobalAdminCookie = request.cookies.get('isGlobalAdmin')?.value;
  const isGlobalAdmin = isGlobalAdminCookie === 'true';
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/dashboard/acesso-negado'
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
    
    // Bloquear rotas não permitidas para Global Admin
    if (isAccessDeniedForGlobalAdmin(pathname, isGlobalAdmin)) {
      return NextResponse.redirect(new URL('/dashboard/acesso-negado', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
};