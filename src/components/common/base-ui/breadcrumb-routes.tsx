"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useCustomerById } from "@/infrastructure/hooks/useCustomers";
import { allNavItems } from "./nav-items";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function BreadcrumbClient(): React.ReactElement {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin);
  const customerIdFromPath = React.useMemo(() => {
    const customersIndex = parts.findIndex(
      (segment) => segment === "customers"
    );
    if (customersIndex === -1) return undefined;
    const candidate = parts[customersIndex + 1];
    const isLikelyId =
      candidate && candidate.length > 8 && candidate.includes("-");
    return isLikelyId ? candidate : undefined;
  }, [parts]);

  const { data: breadcrumbCustomer } = useCustomerById(customerIdFromPath);

  const mapTitle = React.useMemo(() => {
    const m = new Map<string, { label: string; icon?: LucideIcon }>();
    const addItem = (item: {
      title: string;
      url?: string;
      requiresGlobalAdmin?: boolean;
      icon?: LucideIcon;
      children?: typeof allNavItems;
    }) => {
      if (item.requiresGlobalAdmin && !isGlobalAdmin) return;
      if (item.url) m.set(item.url, { label: item.title, icon: item.icon });
      if (item.children && item.children.length) item.children.forEach(addItem);
    };
    allNavItems.forEach(addItem);
    return m;
  }, [isGlobalAdmin]);

  const items = React.useMemo(() => {
    const acc: { href: string; label: string; Icon?: LucideIcon }[] = [];
    let current = "";
    parts.forEach((p) => {
      current += `/${p}`;
      const meta = mapTitle.get(current);
      const isCustomerDetail =
        customerIdFromPath &&
        current.endsWith(`/customers/${customerIdFromPath}`);
      const dynamicLabel =
        isCustomerDetail && breadcrumbCustomer
          ? `${
              breadcrumbCustomer.company?.businessName ??
              breadcrumbCustomer.name ??
              ""
            }`.trim()
          : undefined;
      const label = dynamicLabel ?? meta?.label ?? p;
      acc.push({ href: current, label, Icon: meta?.icon });
    });
    return acc;
  }, [parts, mapTitle, customerIdFromPath, breadcrumbCustomer]);

  return (
    <Breadcrumb>
      <BreadcrumbList className="mx-4 items-end">
        {items.map((c, idx) => (
          <React.Fragment key={c.href}>
            {idx < items.length - 1 ? (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href={c.href}
                    className="font-medium text-muted-foreground hover:text-primary underline-offset-4 text-base transition-colors duration-200"
                  >
                    {c.Icon ? <c.Icon className="h-5 w-5" /> : null}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <span className="hidden md:block text-muted-foreground">
                  {" "}
                  <ChevronRight />{" "}
                </span>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage className="  font-medium  hover:text-primary underline-offset-4  transition-colors duration-200 underline text-base text-blue-500">
                  {c.label}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default BreadcrumbClient;
