"use client"

import { useRoutePermission } from "@/hooks/use-route-permission"
import { AccessDenied } from "./access-denied"
import { ReactNode } from "react"
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { getAccessToken } from "@/infrastructure/utils/api"

interface RouteGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function RouteGuard({ children, fallback }: RouteGuardProps) {
  const { hasAccess, isAuthenticated } = useRoutePermission()
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const token = typeof window !== "undefined" ? getAccessToken() : null
  
  const isLoading = !!token && (isGlobalAdmin === null || isAdmin === null);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando dados...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <>{children}</>
  }

  if (!hasAccess) {
    return fallback || <AccessDenied />
  }

  return <>{children}</>
}
