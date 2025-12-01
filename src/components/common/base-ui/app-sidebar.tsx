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
  const companyId = useAuthStore((state) => state.companyId)
  const companyQuery = useCompanyByIdQuery(companyId ?? undefined)

  const navMain = React.useMemo(() => {
    return getAllNavItems(isGlobalAdmin);
  }, [isGlobalAdmin])

  const sidebarData = React.useMemo(() => {
    const company = companyQuery.data ?? null
    const user = {
      name: "Provision",
      avatarIcon: Buildings,
    }

    const teams = [
      {
        name: company?.businessName ?? company?.taxName ?? "Provision",
        logoIcon: Buildings,
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
          <Image src="/logo.png" alt="Logo" width={80} height={80} className="mx-auto" />
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
