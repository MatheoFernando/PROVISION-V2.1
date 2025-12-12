"use client";
import React from 'react'
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import { Building2 } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import { ServicesMenu } from './services-menu';
import BreadcrumbClient from './breadcrumb-routes';
import NotificationBell from './notification-bell';
import { Button } from '@/components/ui/button';
import { ArrowClockwise } from 'phosphor-react';

function Header() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }

  return (
    <header className="sticky top-0 flex h-16 shrink-0 py-2  bg-white dark:bg-[#0f172a] px-3 md:px-6 justify-between items-center gap-2 md:gap-4 w-full border-b border-slate-200 dark:border-border/50 z-20 backdrop-blur-md ">
      <div className="flex items-center gap-2 flex-1 ">
        <SidebarTrigger className='block ' variant="outline" />
        <BreadcrumbClient />
      </div>
      <div className="flex items-center justify-end  gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full cursor-pointer"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <ArrowClockwise
            className={`size-4 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-all ${isRefreshing ? 'animate-spin' : ''
              }`}
          />
        </Button>
        <NotificationBell />
        <ThemeToggle />
        <ServicesMenu />
        <NavUser user={sidebarData.user} />
      </div>
    </header>
  )
}

export default Header
