"use client"

import * as React from "react"
import {
 Building2
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { allNavItems} from "./nav-items"
import { useCompanyByIdQuery } from '@/infrastructure/hooks/useCompanies'
import Image from "next/image"
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin)
  const companyId = useAuthStore((state) => state.companyId)
  const companyQuery = useCompanyByIdQuery(companyId ?? undefined)
 
  const navMain = React.useMemo(() => {
    return allNavItems.filter((item) => {
      // Se requiresGlobalAdmin é true, só mostrar para global admin
      if (item.requiresGlobalAdmin === true) {
        return isGlobalAdmin;
      }
      
      // Se requiresGlobalAdmin é false, só mostrar para usuários normais (não global admin)
      if (item.requiresGlobalAdmin === false) {
        return !isGlobalAdmin;
      }
      
      // Se requiresGlobalAdmin é undefined, mostrar para todos os usuários autenticados
      return true;
    })
  }, [isGlobalAdmin])

  const sidebarData = React.useMemo(() => {
    const company = companyQuery.data ?? null
    const user = {
      name: "Provision",
      avatarIcon: Building2,
    }

    const teams = [
      {
        name: company?.businessName ?? company?.taxName ?? "Provision",
        logoIcon: Building2,
      },
    ]

    return {
      user,
      teams,
      navMain,
    }
  }, [companyQuery.data, navMain])

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props} >
      <SidebarHeader className="md:pt-8">
        <Link href="/dashboard" prefetch>
        <Image src="/logo.png" alt="Logo" width={80} height={80} className="mx-auto"/>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
      V2
      </SidebarFooter>
    </Sidebar>
  )
}
