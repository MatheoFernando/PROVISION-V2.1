"use client"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import type { NavItem } from "./nav-items"
import { allNavItems } from "./nav-items"

export function NavMain({
  items = allNavItems,
}: { items?: (NavItem & { isActive?: boolean; items?: NavItem[]; children?: NavItem[] })[] }) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const isActiveUrl = (url?: string) => {
    if (!url) return false
    if (url === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(url)
  }
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          if (item.items?.length) {
            return (
              <DropdownMenu key={item.title}>
                <SidebarMenuItem>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors duration-200">
                      {item.icon && <item.icon className="size-4" />}
                      <span>{item.title}</span>
                      <MoreHorizontal className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                    className="min-w-56 rounded-lg"
                  >
                    <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                    {item.items.map((subItem) => (
                      <DropdownMenuItem asChild key={subItem.title}>
                        <a href={subItem.url}>
                          {subItem.icon && <subItem.icon className="size-4" />}
                          <span>{subItem.title}</span>
                        </a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </SidebarMenuItem>
              </DropdownMenu>
            )
          }

          // Se não tem subitens, renderiza como botão simples
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} isActive={isActiveUrl(item.url)}>
                <a href={item.url ?? "#"}>
                  {item.icon && <item.icon className="size-4" />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
