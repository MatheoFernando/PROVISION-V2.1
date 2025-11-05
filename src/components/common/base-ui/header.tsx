"use client";
import React from 'react'
import { NotificationBell } from './notification-bell'
import { KeyboardSearch } from './keyboard-search';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Image from 'next/image';
import { NavUser } from './nav-user';
import { Building2 } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import { ServicesMenu } from './services-menu';

function Header() {
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
        plan: "Enterprise",
      },
    ],
  }

  return (
        <header className="sticky top-0 flex h-16 md:h-18 shrink-0 bg-gray-50 dark:bg-[#0f172a]  text-slate-300 py-2 md:py-3 px-3 md:px-6 justify-between items-center gap-2 md:gap-4 w-full border-b border-white/10 dark:border-border/50 z-50 backdrop-blur-md">
      <div className="flex items-baseline gap-2 md:gap-4 flex-1 ">
        <SidebarTrigger className='md:hidden block' />
        <div className="hidden md:block">
          {/* Logo ou título da empresa para desktop */}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 ">
        <div className="block">
          <KeyboardSearch />
        </div>
        <NotificationBell />
        <ThemeToggle />
        <ServicesMenu />
        <NavUser user={sidebarData.user} />
      </div>
    </header>
  )
}

export default Header
