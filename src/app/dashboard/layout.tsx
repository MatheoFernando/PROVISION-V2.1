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
      <div className="flex h-screen w-full bg-[#f7f9fa] text-foreground transition-colors">
        <AppSidebar />

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
