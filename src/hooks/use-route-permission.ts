"use client"

import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { canAccessRoute } from "@/infrastructure/utils/route-permissions"
import { usePathname } from "next/navigation"

export function useRoutePermission() {
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const pathname = usePathname()

  const hasAccess = canAccessRoute(pathname, isGlobalAdmin, isAuthenticated)
  
  return {
    hasAccess,
    isGlobalAdmin,
    isAuthenticated,
    pathname
  }
}
