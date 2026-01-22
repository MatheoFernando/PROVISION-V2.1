"use client"

import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { canAccessRoute } from "@/infrastructure/utils/route-permissions"
import { usePathname } from "next/navigation"
import { getAccessToken } from "@/infrastructure/utils/api"

export function useRoutePermission() {
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin)
  const userId = useAuthStore((state) => state.userId)
  const pathname = usePathname()
  
  const token = typeof window !== "undefined" ? getAccessToken() : null
  const isAuthenticated = Boolean(token && userId)

  const hasAccess = canAccessRoute(pathname, isGlobalAdmin ?? false, isAuthenticated)
  
  return {
    hasAccess,
    isGlobalAdmin,
    isAuthenticated,
    pathname
  }
}
