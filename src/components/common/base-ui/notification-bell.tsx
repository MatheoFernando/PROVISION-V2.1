"use client";
import React from 'react'
import { Bell } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

export function NotificationBell() {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button className="relative p-2 bg-transparent hover:bg-white/10 cursor-pointer transition-colors duration-200" variant="ghost">
          <Bell className="size-4 md:size-5 text-white" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
            3
          </span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Notificações</DrawerTitle>
          <DrawerDescription>
            Você tem 3 notificações não lidas
          </DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}

export default NotificationBell
