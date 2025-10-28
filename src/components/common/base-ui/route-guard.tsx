"use client"

import { useRoutePermission } from "@/hooks/use-route-permission"
import { AccessDenied } from "./access-denied"
import { ReactNode } from "react"

interface RouteGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function RouteGuard({ children, fallback }: RouteGuardProps) {
  const { hasAccess } = useRoutePermission()

  if (!hasAccess) {
    return fallback || <AccessDenied />
  }

  return <>{children}</>
}
