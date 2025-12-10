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
import { useTranslations } from "next-intl";
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

function hasActiveChild(item: NavItem, pathname: string): boolean {
  if (item.url) {
    if (item.url === "/dashboard") {
      if (pathname === "/dashboard") return true;
    } else if (pathname.startsWith(item.url)) {
      return true;
    }
  }
  if (item.items?.length) {
    return item.items.some((subItem) => hasActiveChild(subItem, pathname));
  }
  return false;
}

function NavMenuItem({ item, pathname, level = 0 }: { item: NavItem; pathname: string; level?: number }) {
  const t = useTranslations();
  // Note: t is not passed down. We should probably use translations in the parent and pass translated title, 
  // OR use useTranslations inside this component.
  // Ideally, if item.title is a key, we translate it.

  const title = item.title.includes('.') ? t(item.title) : item.title;

  const isActiveUrl = (url?: string) => {
    if (!url) return false;
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  const hasSubItems = item.items && item.items.length > 0;
  const isActive = hasActiveChild(item, pathname);

  if (hasSubItems) {
    return (
      <SidebarMenuSubItem>
        <Collapsible
          defaultOpen={isActive}
          className="group/collapsible"
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton>
              {item.icon && <item.icon className="size-4" />}
              <span>{title}</span>
              <CaretRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuSubButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items!.map((subItem) => (
                <NavMenuItem
                  key={subItem.title}
                  item={subItem}
                  pathname={pathname}
                  level={level + 1}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuSubItem>
    );
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        isActive={isActiveUrl(item.url)}
      >
        <Link href={item.url ?? "#"} prefetch>
          {item.icon && <item.icon className="size-4" />}
          <span>{title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

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
  const t = useTranslations();

  // Need to define isActiveUrl here too as it's not exported
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
          const title = item.title.includes('.') ? t(item.title) : item.title;

          if (item.items?.length) {
            const isActive = hasActiveChild(item, pathname);
            return (
              <SidebarMenuItem key={item.title}>
                <Collapsible
                  defaultOpen={item.isActive || isActive}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={title}>
                      {item.icon && <item.icon className="size-4" />}
                      <span>{title}</span>
                      <CaretRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <NavMenuItem
                          key={subItem.title}
                          item={subItem}
                          pathname={pathname}
                          level={1}
                        />
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
                tooltip={title}
                isActive={isActiveUrl(item.url)}
              >
                <Link href={item.url ?? "#"} prefetch>
                  {item.icon && <item.icon className="size-4" />}
                  <span>{title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
