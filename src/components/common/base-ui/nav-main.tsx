"use client";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretRight } from "phosphor-react";
import { allNavItems } from "./nav-items";
import Link from "next/link";

type NavItem = {
  title: string;
  url?: string;
  icon?: any;
  items?: NavItem[];
  children?: NavItem[];
};

export function NavMain({
  items = allNavItems,
}: {
  items?: (NavItem & {
    isActive?: boolean;
    items?: NavItem[];
    children?: NavItem[];
  })[];
}) {
  const pathname = usePathname();
  const isActiveUrl = (url?: string) => {
    if (!url) return false;
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="mb-2 text-xs font-medium text-gray-500 tracking-wider">
        Menu
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (item.items?.length) {
            const hasActiveSubItem = item.items.some((subItem) =>
              isActiveUrl(subItem.url)
            );
            return (
              <SidebarMenuItem key={item.title}>
                <Collapsible
                  defaultOpen={item.isActive || hasActiveSubItem}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} >
                      {item.icon && <item.icon className="size-4 " />}
                      <span>{item.title}</span>
                      <CaretRight className="ml-auto  transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActiveUrl(subItem.url)}
                          >
                            <Link href={subItem.url ?? "#"} prefetch >
                              {subItem.icon && (
                                <subItem.icon className="size-4 text-white" />
                              )}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            );
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActiveUrl(item.url)}
              >
                <Link href={item.url ?? "#"} prefetch>
                  {item.icon && <item.icon className="size-4" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
