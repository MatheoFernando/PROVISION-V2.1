// src/components/common/base-ui/nav-items.ts
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
  UserCheck,
  Building,
  Car,
} from "lucide-react";

export interface BaseNavItem {
  title: string;
  url: string;
  requiresGlobalAdmin?: boolean;
  icon?: LucideIcon;
}

export const allNavItems: BaseNavItem[] = [
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
    title: "Configurações",
    url: "/dashboard/settings",
    requiresGlobalAdmin: true,
    icon: Settings2,
  },
  {
    title: "Veiculos",
    url: "/dashboard/cars",
    requiresGlobalAdmin: false,
    icon: Car,
  },
];

export const adminOnlyPaths: string[] = allNavItems
  .filter((item) => Boolean(item.requiresGlobalAdmin))
  .map((item) => item.url);
