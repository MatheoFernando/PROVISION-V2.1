import { Metadata } from "next";
import React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/base-ui/app-sidebar";
import Header from "@/components/common/base-ui/header";
import BreadcrumbClient from "@/components/common/base-ui/breadcrumb-routes";

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
      <div className="flex h-screen w-full bg-background text-foreground transition-colors">
        <AppSidebar />
        <SidebarTrigger
          className="hidden md:flex fixed z-50
            top-5
            left-[calc(var(--sidebar-width)+0.3rem)]
            peer-data-[collapsible=icon]:left-[calc(var(--sidebar-width-icon)+.5rem)]
            group-data-[collapsible=offcanvas]:hidden
            -translate-x-1/2
            opacity-100 transition-all duration-200
            rounded-full bg-card/90 dark:bg-card/80 shadow-xl ring-1 ring-border/60 backdrop-blur-md glass-effect border 
            size-10 [&>svg]:size-6 hover:bg-muted hover:scale-100 dark:hover:bg-muted/60 cursor-pointer"
        />
        <SidebarInset className="flex-1 min-w-0 flex flex-col">
          <Header />
          <div className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6 transition-colors dark:bg-background">
           {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
