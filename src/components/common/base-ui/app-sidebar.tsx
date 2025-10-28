"use client"

import * as React from "react"
import {
 Building2
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { TeamSwitcher } from "./team-switcher"
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { allNavItems} from "./nav-items"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin)

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

  const sidebarData = {
    user: {
      name: "Provision",
      email: "admin@provision.com",
      avatarIcon: Building2,
    },
    teams: [
      {
        name: "Provision",
        logoIcon: Building2,
        plan: "Admin",
      },
    ],
    navMain,
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props} >
      <SidebarHeader className="bg-sidebar border-b border-sidebar-border">
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
