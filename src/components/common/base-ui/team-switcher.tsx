"use client"

import * as React from "react"
import { ChevronDown  , ArrowRightLeft , Building2 } from "lucide-react"
import Image from "next/image"
import type { LucideIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
    <SidebarMenu className="mt-4 md:mt-20 border-b border-sidebar-border pb-6">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild >
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors duration-200"
            >
              <div className="text-sidebar-primary-foreground flex aspect-square size-12 items-center justify-center rounded-lg overflow-hidden shrink-0 group-has-[:where([data-collapsible=icon])]/sidebar-wrapper:size-8">
                {activeTeam.logo ? (
                  <Image
                    src={activeTeam.logo}
                    alt={activeTeam.name}
                    width={80}
                    height={80}
                    className="size-full object-contain p-1 group-has-[:where([data-collapsible=icon])]/sidebar-wrapper:p-0"
                  />
                ) : (
                  <div className="bg-sidebar-primary rounded p-3">
                    <LogoIcon className="size-5 group-has-[:where([data-collapsible=icon])]/sidebar-wrapper:size-4 text-sidebar-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-base">{activeTeam.name}</span>
                <span className="truncate text-xs text-muted-foreground">{activeTeam.plan}</span>
              </div>
              <ChevronDown   className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Empresa
            </DropdownMenuLabel>
            {teams.map((team) => {
              const TeamIcon = team.logoIcon || Building2
              return (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border overflow-hidden">
                    {team.logo ? (
                      <Image
                        src={team.logo}
                        alt={team.name}
                        width={24}
                        height={24}
                        className="size-full object-contain p-0.5"
                      />
                    ) : (
                      <TeamIcon className="size-4" />
                    )}
                  </div>
                  {team.name}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <ArrowRightLeft  className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Mudar empresa</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
