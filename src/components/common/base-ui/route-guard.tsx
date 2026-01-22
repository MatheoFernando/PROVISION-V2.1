"use client"

import { useRoutePermission } from "@/hooks/use-route-permission"
import { AccessDenied } from "./access-denied"
import { ReactNode, useEffect, useState } from "react"
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { getAccessToken } from "@/infrastructure/utils/api"

interface RouteGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function RouteGuard({ children, fallback }: RouteGuardProps) {
  const { hasAccess, isAuthenticated } = useRoutePermission()
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin)
  const userId = useAuthStore((state) => state.userId)
  const token = typeof window !== "undefined" ? getAccessToken() : null
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Se já tem dados carregados, não precisa esperar
    if (token && userId && isGlobalAdmin !== null) {
      setIsLoading(false)
      return
    }

    // Se não tem token, não precisa esperar
    if (!token) {
      setIsLoading(false)
      return
    }

    // Se tem token mas ainda não carregou dados, aguardar até 10s
    const timer = setTimeout(() => {     setIsLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [token, userId, isGlobalAdmin])
  
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
