"use client"

import {
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { useRouter } from "next/navigation"

interface UserData {
  name: string
  email: string
  avatar?: string
  avatarIcon?: LucideIcon
}

export function NavUser({
  user,
}: {
  user: UserData
}) {
  const { isMobile } = useSidebar()
  const AvatarIcon = user.avatarIcon || User
  const router = useRouter()
  return (
    <SidebarMenu className="w-auto sm:w-fit">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
         
              className="data-[state=open]:bg-white/10 data-[state=open]:text-white cursor-pointer hover:bg-white/5 transition-colors duration-200 px-0   gap-0.5 "
            >
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg ">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-full  text-gray-500 dark:text-gray-400 bg-white font-medium uppercase border">
                  <User className="size-5" />
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="text-gray-500" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "bottom"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-2 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {user.avatar ? (
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      <AvatarIcon className="size-4 md:size-5" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border ">
                    <AvatarIcon className="size-4 md:size-5" />
                  </div>
                )}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-foreground text-base">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
           
              <DropdownMenuItem className="cursor-pointer hover:bg-blue-100 hover:text-blue-500" onClick={() => router.push('/dashboard/user-settings')}>
                <Settings className="hover:bg-blue-100 hover:text-blue-500" />
                Configurações
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer hover:bg-blue-100 hover:text-blue-500">
              <LogOut className=" hover:bg-blue-100 hover:text-blue-500" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
