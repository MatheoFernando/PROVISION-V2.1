export interface RoutePermission {
  path: string;
  requiresGlobalAdmin: boolean | undefined;
  requiresAuth: boolean;
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Rotas públicas
  { path: '/', requiresGlobalAdmin: false, requiresAuth: false },
  { path: '/login', requiresGlobalAdmin: false, requiresAuth: false },
  
  // Dashboard principal - todos os usuários autenticados
  { path: '/dashboard', requiresGlobalAdmin: false, requiresAuth: true },
  
  // Rotas que requerem Global Admin (true)
  { path: '/dashboard/users', requiresGlobalAdmin: true, requiresAuth: true },
  { path: '/dashboard/companies', requiresGlobalAdmin: true, requiresAuth: true },
  { path: '/dashboard/settings', requiresGlobalAdmin: true, requiresAuth: true },
  
  // Rotas que NÃO requerem Global Admin (false) - usuários normais
  { path: '/dashboard/equipment', requiresGlobalAdmin: false, requiresAuth: true },
  { path: '/dashboard/containers', requiresGlobalAdmin: false, requiresAuth: true },
  { path: '/dashboard/cars', requiresGlobalAdmin: false, requiresAuth: true },
  { path: '/dashboard/customers', requiresGlobalAdmin: false, requiresAuth: true },
  { path: '/dashboard/sites', requiresGlobalAdmin: false, requiresAuth: true },
  { path: '/dashboard/employees', requiresGlobalAdmin: false, requiresAuth: true },
  
  // Serviços - sem restrição específica (undefined)
  { path: '/dashboard/service', requiresGlobalAdmin: undefined, requiresAuth: true },
  { path: '/dashboard/service/occurrence', requiresGlobalAdmin: undefined, requiresAuth: true },
  { path: '/dashboard/service/rsu', requiresGlobalAdmin: undefined, requiresAuth: true },
  { path: '/dashboard/service/supervision', requiresGlobalAdmin: undefined, requiresAuth: true },
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

export function canAccessRoute(pathname: string, isGlobalAdmin: boolean, isAuthenticated: boolean): boolean {
  const permission = getRoutePermission(pathname);
  
  if (!permission) {
    // Se não há permissão definida, assumir que requer autenticação
    return isAuthenticated;
  }
  
  // Verificar se precisa de autenticação
  if (permission.requiresAuth && !isAuthenticated) {
    return false;
  }
  
  // Se requiresGlobalAdmin é true, só global admin pode acessar
  if (permission.requiresGlobalAdmin === true) {
    return isGlobalAdmin;
  }
  
  // Se requiresGlobalAdmin é false, só usuários normais podem acessar
  if (permission.requiresGlobalAdmin === false) {
    return !isGlobalAdmin;
  }
  
  // Se requiresGlobalAdmin é undefined, qualquer usuário autenticado pode acessar
  return true;
}
