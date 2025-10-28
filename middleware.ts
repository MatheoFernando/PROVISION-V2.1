import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { canAccessRoute } from './src/infrastructure/utils/route-permissions';

const PUBLIC_PATHS = ['/', '/favicon.ico', '/_next', '/api', '/public'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function getIsGlobalAdminFromToken(token: string): boolean {
  try {
    // Decodificar o JWT token para extrair informações do usuário
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.isGlobalAdmin === true;
  } catch {
    // Se não conseguir decodificar, assumir que não é global admin
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;
  const isAuthenticated = Boolean(token);
  
  // Tentar obter isGlobalAdmin do token ou assumir false
  let isGlobalAdmin = false;
  if (token) {
    isGlobalAdmin = getIsGlobalAdminFromToken(token);
  }

  
  if (!isAuthenticated && !isPublicPath(pathname)) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

 
  if (isAuthenticated && pathname === '/') {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && !isPublicPath(pathname)) {
    const hasAccess = canAccessRoute(pathname, isGlobalAdmin, isAuthenticated);
    
    if (!hasAccess) {
      const url = new URL('/access-denied', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};


