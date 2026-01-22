export interface RoutePermission {
  path: string;
  requiresGlobalAdmin: boolean | undefined;
  requiresAuth: boolean;
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  { path: '/', requiresGlobalAdmin: false, requiresAuth: false },
  { path: '/login', requiresGlobalAdmin: false, requiresAuth: false },

  { path: '/dashboard/empresa/create', requiresGlobalAdmin: true, requiresAuth: true },
  { path: '/dashboard', requiresGlobalAdmin: undefined, requiresAuth: true },
];

export function getRoutePermission(pathname: string): RoutePermission | null {
  // Busca exata primeiro
  const exactMatch = ROUTE_PERMISSIONS.find(route => route.path === pathname);
  if (exactMatch) return exactMatch;

  // Busca por prefixo para rotas aninhadas
  const prefixMatch = ROUTE_PERMISSIONS.find(route =>
    pathname.startsWith(route.path + '/') || pathname.startsWith(route.path + '?')
  );
  if (prefixMatch) return prefixMatch;

  return null;
}

export function canAccessRoute(pathname: string, isGlobalAdmin: boolean | null, isAuthenticated: boolean): boolean {
  // O middleware já bloqueia as rotas, aqui só verificamos autenticação
  if (!isAuthenticated) {
    return false;
  }

  // Se ainda está carregando, permitir temporariamente
  if (isGlobalAdmin === null) {
    return true;
  }

  return true;
}
