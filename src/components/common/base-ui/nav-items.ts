"use client";

import {
  type LucideIcon,
  Home,
  Users,
  Building2,
  Settings2,
  User2,
  Briefcase,
  Hammer,
  Package,
  Truck,
  UserCheck,
  Building,
} from "lucide-react";

export interface NavItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  requiresGlobalAdmin?: boolean;
  items?: NavItem[];
}

export const allNavItems: NavItem[] = [
  { title: "Início", url: "/dashboard", icon: Home },
  { title: "Serviço", url: "/dashboard/service", icon: Briefcase },
  {
    title: "Clientes",
    url: "/dashboard/customers",
    icon: UserCheck,
    requiresGlobalAdmin: false,
  },
  {
    title: "Sites",
    url: "/dashboard/sites",
    icon: Building,
    requiresGlobalAdmin: false,
  },
  {
    title: "Funcionários",
    url: "/dashboard/employees",
    icon: User2,
    requiresGlobalAdmin: false,
  },
  {
    title: "Utilizadores",
    url: "/dashboard/users",
    icon: Users,
    requiresGlobalAdmin: true,
  },
  {
    title: "Empresas",
    url: "/dashboard/companies",
    icon: Building2,
    requiresGlobalAdmin: true,
  },
  {
    title: "Configurações",
    url: "/dashboard/settings",
    icon: Settings2,
    requiresGlobalAdmin: true,
  },
  {
    title: "Equipamentos",
    url: "/dashboard/equipment",
    icon: Hammer,
    requiresGlobalAdmin: false,
  },
  {
    title: "Containers",
    url: "/dashboard/containers",
    icon: Package,
    requiresGlobalAdmin: false,
  },
  {
    title: "Veículos",
    url: "/dashboard/cars",
    icon: Truck,
    requiresGlobalAdmin: false,
  },
 


];
