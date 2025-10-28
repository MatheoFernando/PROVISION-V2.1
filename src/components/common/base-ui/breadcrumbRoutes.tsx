"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { allNavItems } from "./nav-items"

export function BreadcrumbClient(): React.ReactElement {
  const pathname = usePathname()
  const parts = pathname.split("/").filter(Boolean)
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin)

  const mapTitle = React.useMemo(() => {
    const m = new Map<string, string>()
    const addItem = (item: { title: string; url?: string; requiresGlobalAdmin?: boolean; children?: typeof allNavItems }) => {
      if (item.requiresGlobalAdmin && !isGlobalAdmin) return
      if (item.url) m.set(item.url, item.title)
      if (item.children && item.children.length) item.children.forEach(addItem)
    }
    allNavItems.forEach(addItem)
    return m
  }, [isGlobalAdmin])

  const items = React.useMemo(() => {
    const acc: { href: string; label: string }[] = []
    let current = ""
    parts.forEach((p) => {
      current += `/${p}`
      const label = mapTitle.get(current) ?? p
      acc.push({ href: current, label })
    })
    return acc
  }, [parts, mapTitle])

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((c, idx) => (
          <React.Fragment key={c.href}>
            {idx < items.length - 1 ? (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={c.href} className="font-medium text-primary hover:text-primary/80 underline-offset-4 underline text-base transition-colors duration-200">{c.label}</BreadcrumbLink>
                </BreadcrumbItem>
                <span className="hidden md:block text-muted-foreground"> / </span>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary underline text-base">{c.label}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadcrumbClient


