"use client"

import * as React from "react"
import {
  Buildings
} from "phosphor-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { getAllNavItems } from "./nav-items"
import { useCompanyByIdQuery } from '@/infrastructure/hooks/useCompanies'
import Image from "next/image"
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const companyId = useAuthStore((state) => state.companyId)
  const companyQuery = useCompanyByIdQuery(companyId ?? undefined)

  const navMain = React.useMemo(() => {
    if (isGlobalAdmin === null) return [];
    return getAllNavItems(isGlobalAdmin, isAdmin ?? false);
  }, [isGlobalAdmin, isAdmin])

  const sidebarData = React.useMemo(() => {
    const company = companyQuery.data ?? null
  

    const teams = [
      {
        name: company?.businessName ?? company?.taxName ?? "Provision",
        logoIcon: Buildings,
      },
    ]

    return {
      teams,
      navMain,
    }
  }, [companyQuery.data, navMain])

  if (isGlobalAdmin === null) {
      return (
        <Sidebar collapsible="icon" variant="sidebar" {...props} className="bg-white dark:bg-background text-sidebar-foreground border-r border-sidebar-border" >
        <SidebarHeader className="md:pt-8">
            <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-blue-50" />
        </SidebarHeader>
        <SidebarContent className="px-4">
            <div className="mt-8 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-5 w-full animate-pulse rounded-md bg-blue-50" />
            ))}
            </div>
        </SidebarContent>
        </Sidebar>
      )
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props} className="bg-white dark:bg-background text-sidebar-foreground border-r border-sidebar-border" >
      <SidebarHeader className="md:pt-8">
        <Link href="/dashboard" prefetch>
          <Image src="/logo.png" alt="Logo" width={80} height={80} className="mx-auto" priority style={{ height: "auto" }} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter className="text-xl font-bold underline mb-6">
        V 2.1.0
      </SidebarFooter>
    </Sidebar>
  )
}
