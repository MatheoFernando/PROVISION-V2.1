"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton";

import { getAllNavItems } from "./nav-items";
import type { LucideIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { useSiteById } from "@/infrastructure/hooks/useSites";
import { useCustomerById } from "@/infrastructure/hooks/useCustomers";
import { useEmployeeById } from "@/infrastructure/hooks/useEmployees";
import { useCompaniesQuery } from "@/infrastructure/hooks/useCompanies";

export function BreadcrumbClient(): React.ReactElement {
  const pathname = usePathname();
  const t = useTranslations();

  const parts = pathname.split("/").filter(Boolean);
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin);

  const siteIdFromPath = React.useMemo(() => {
    const sitesIndex = parts.indexOf("sites");
    if (sitesIndex !== -1 && parts[sitesIndex + 1]) {
      const candidate = parts[sitesIndex + 1];
      if (candidate.length > 20 && candidate !== "create") return candidate;
    }
    return undefined;
  }, [parts]);

  const customerIdFromPath = React.useMemo(() => {
    const clientsIndex = parts.indexOf("clientes");
    if (clientsIndex !== -1 && parts[clientsIndex + 1]) {
      const candidate = parts[clientsIndex + 1];
      if (candidate.length > 20 && candidate !== "create") return candidate;
    }
    return undefined;
  }, [parts]);

  const employeeIdFromPath = React.useMemo(() => {
    const employeesIndex = parts.indexOf("funcionarios");
    if (employeesIndex !== -1 && parts[employeesIndex + 1]) {
      const candidate = parts[employeesIndex + 1];
      if (candidate.length > 20 && candidate !== "create") return candidate;
    }
    return undefined;
  }, [parts]);

  const { data: site, isLoading: isLoadingSite } = useSiteById(siteIdFromPath || "");
  const { data: customer, isLoading: isLoadingCustomer } = useCustomerById(customerIdFromPath);
  const companyId = useAuthStore((state) => state.companyId) ?? "";
  const { data: employee, isLoading: isLoadingEmployee } = useEmployeeById(employeeIdFromPath, companyId);
  
  const companySlugFromPath = React.useMemo(() => {
    const empresaIndex = parts.indexOf("empresa");
    if (empresaIndex !== -1 && parts[empresaIndex + 1]) {
      return parts[empresaIndex + 1];
    }
    return undefined;
  }, [parts]);

  const { data: companies, isLoading: isLoadingCompanies } = useCompaniesQuery({ enabled: !!companySlugFromPath });
  
  const companyFromSlug = React.useMemo(() => {
    if (!companies || !companySlugFromPath) return null;
    const slugify = (text: string): string => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    };
    return companies.find(c => {
      const companySlug = slugify(c.businessName);
      return companySlug === companySlugFromPath || c.id === companySlugFromPath;
    }) || null;
  }, [companies, companySlugFromPath]);


  const mapTitle = React.useMemo(() => {
    const m = new Map<string, { label: string; icon?: LucideIcon }>();
    const navItems = getAllNavItems(isGlobalAdmin ?? false);

    const addItem = (item: {
      title: string;
      url?: string;
      requiresGlobalAdmin?: boolean;
      icon?: LucideIcon;
      items?: typeof navItems;
    }) => {
      if (item.requiresGlobalAdmin && !isGlobalAdmin) return;

      if (item.url) m.set(item.url, { label: item.title, icon: item.icon });
      if (item.items && item.items.length) item.items.forEach(addItem);
    };

    navItems.forEach(addItem);
    return m;
  }, [isGlobalAdmin]);

  const client = React.useMemo(() => {
    if (!site) return undefined;
    const c = site.customer ?? (Array.isArray(site.customers) ? site.customers[0] : site.customers);
    return c;
  }, [site]);

  const items = React.useMemo(() => {
    const acc: { href: string; label: string; Icon?: LucideIcon; isLoading?: boolean }[] = [];
    let current = "";

    parts.forEach((p, index) => {
      current += `/${p}`;
      const meta = mapTitle.get(current);
      let label = meta?.label;
      let isLoading = false;

      if (label) {

        if (label.includes('.')) {
          try {
            label = t(label);
          } catch (e) {

          }
        }
      } else {
        if (p === 'create') {
          label = t('Common.create') || 'Create';
        } else if (p === siteIdFromPath) {
          if (isLoadingSite) {
            isLoading = true;
            label = "";
          } else {
            if (client && site) {
              label = `${client.cod} - ${client.name} - ${site.name}`;
            } else {
              label = site?.name || p;
            }
          }
        } else if (p === customerIdFromPath) {
          if (isLoadingCustomer) {
            isLoading = true;
            label = "";
          } else {
            if (customer) {
              label = `${customer.cod} - ${customer.name}`;
            } else {
              label = p;
            }
          }
        } else if (p === employeeIdFromPath) {
          if (isLoadingEmployee) {
            isLoading = true;
            label = "";
          } else {
            if (employee) {
              label = `${employee.cod} - ${employee.fullName}`;
            } else {
              label = p;
            }
          }
        } else if (p === companySlugFromPath) {
          if (isLoadingCompanies || !companyFromSlug) {
            isLoading = true;
            label = "";
          } else {
            label = companyFromSlug.businessName;
          }
        } else {
          if (p.length > 20 && p.includes('-')) {
            label = p.substring(0, 8) + '...';
          } else {
            label = p.charAt(0).toUpperCase() + p.slice(1);
          }
        }
      }


      acc.push({ href: current, label: label || p, Icon: meta?.icon, isLoading });
    });
    return acc;
  }, [parts, mapTitle, siteIdFromPath, site, client, isLoadingSite, t, customerIdFromPath, customer, isLoadingCustomer, employeeIdFromPath, employee, isLoadingEmployee, companySlugFromPath, companyFromSlug]);


  return (
    <Breadcrumb>
      <BreadcrumbList className="mx-4 ">
        {items.map((c, idx) => (
          <React.Fragment key={c.href}>
            {idx < items.length - 1 ? (
              <>

              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary text-lg font-semibold flex items-center gap-2">
                  {c.isLoading ? (
                    <Skeleton className="h-6 w-32 rounded-lg" />
                  ) : (
                    c.label
                  )}
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
