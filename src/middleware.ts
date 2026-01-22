import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { superAdminOnlyPaths, blockedForSuperAdminPaths } from '@/config/nav-data';

function isBlockedForSuperAdmin(pathname: string, isGlobalAdmin: boolean): boolean {
  if (!isGlobalAdmin) return false;
  
  // Dashboard principal é acessível para todos
  if (pathname === '/dashboard') return false;
  
  // Super admin só pode acessar rotas permitidas
  const isAllowedPath = superAdminOnlyPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );
  
  // Se é rota permitida, não bloquear
  if (isAllowedPath) return false;
  
  // Se não é rota permitida, verifica se está na lista de bloqueadas
  return blockedForSuperAdminPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );
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
    
    // Bloquear rotas para super admin
    if (isBlockedForSuperAdmin(pathname, isGlobalAdmin)) {
      return NextResponse.redirect(new URL('/dashboard/acesso-negado', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
};