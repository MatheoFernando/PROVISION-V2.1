import { Metadata } from 'next';
import React from 'react'
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from '@/components/common/base-ui/app-sidebar';
import Header from '@/components/common/base-ui/header';
import BreadcrumbClient from '@/components/common/base-ui/breadcrumbRoutes';

export const metadata: Metadata = {
    title: "Provision",
    description: "",
  };

  export default function RootLayoutDashboard({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex flex-col h-screen w-full overflow-hidden">
          <Header />
          <div className="flex flex-1 min-h-0">
            <AppSidebar />
            <SidebarTrigger
              className="hidden md:flex fixed z-20
              top-24
              left-[calc(var(--sidebar-width)+0.5rem)]
              peer-data-[collapsible=icon]:left-[calc(var(--sidebar-width-icon)+1rem)]
              group-data-[collapsible=offcanvas]:hidden
              -translate-x-1/2
              opacity-100 transition-all duration-200
              rounded-full bg-card/90 shadow-xl ring-1 ring-border/60 backdrop-blur-md glass-effect
              size-10 [&>svg]:size-6 hover:bg-muted hover:scale-100 cursor-pointer"
            />
            <SidebarInset className="flex-1 min-w-0">
              <div className="flex flex-1 flex-col gap-6 p-4 md:px-12 pt-8 bg-background min-h-0 overflow-hidden">
                <BreadcrumbClient />
                <div className="flex-1 min-h-0 overflow-auto">
                  {children}
                </div>
              </div>
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    );
  }
  