"use client";
import React from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import { Building2 } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import { ServicesMenu } from './services-menu';
import Image from 'next/image';
import BreadcrumbClient from './breadcrumb-routes';
import NotificationBell from './notification-bell';

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
        <header className="sticky top-0 flex h-16 md:h-20 shrink-0 py-2 md:py-4 bg-white dark:bg-[#0f172a] px-3 md:px-6 justify-between items-center gap-2 md:gap-4 w-full border-b border-white/10 dark:border-border/50 z-20 backdrop-blur-md ">
      <div className="flex items-baseline gap-2 flex-1 ">
        <SidebarTrigger className='md:hidden block' />
        <BreadcrumbClient />
      </div>
      <div className="flex items-center justify-end  gap-4">
        <NotificationBell />
        <ThemeToggle />
        <ServicesMenu />
        <NavUser user={sidebarData.user} />
      </div>
    </header>
  )
}

export default Header
