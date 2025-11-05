"use client"

import * as React from "react"
import { Building2 } from "lucide-react"
import Image from "next/image"
import type { LucideIcon } from "lucide-react"

import {
  DropdownMenu,

  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface Team {
  name: string
  logo?: string
  logoIcon?: LucideIcon
  plan: string
}

export function TeamSwitcher({
  teams,
}: {
  teams: Team[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  const LogoIcon = activeTeam.logoIcon || Building2

  return (
    <SidebarMenu className="mt-4 md:mt-20 ">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild >
        <div className="flex items-center gap-2 md:gap-4">
              <div className="text-white flex aspect-square size-12 items-center justify-center rounded-lg overflow-hidden shrink-0 group-has-[:where([data-collapsible=icon])]/sidebar-wrapper:size-8">
                {activeTeam.logo ? (
                  <Image
                    src={activeTeam.logo}
                    alt={activeTeam.name}
                    width={80}
                    height={80}
                    className="size-full object-contain p-1 group-has-[:where([data-collapsible=icon])]/sidebar-wrapper:p-0"
                  />
                ) : (
                  <div className="bg-blue-700 rounded p-3">
                    <LogoIcon className="size-5 group-has-[:where([data-collapsible=icon])]/sidebar-wrapper:size-4 text-white" />
                  </div>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-base text-white">{activeTeam.name}</span>
                <span className="truncate text-xs text-white/70">{activeTeam.plan}</span>
              </div>
            
            </div>
          </DropdownMenuTrigger>
      
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
