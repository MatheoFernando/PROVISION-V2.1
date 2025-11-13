import {
  type LucideIcon,
  LayoutDashboard ,
  Users,
  Building2,
  Settings,
  User2,
  Briefcase,
  Hammer,
  UserCheck,
  Building,
  Car,
  ChartNoAxesCombined 
} from "lucide-react";

export interface BaseNavItem {
  title: string;
  url: string;
  requiresGlobalAdmin?: boolean;
  icon?: LucideIcon;
}

export const allNavItems: BaseNavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard  },
  { title: "Serviço", url: "/dashboard/service", icon: Briefcase },
  {
    title: "Clientes",
    url: "/dashboard/customers",
    icon: UserCheck,

  },
  {
    title: "Sites",
    url: "/dashboard/sites",
    icon: Building,
 
  },
  {
    title: "Funcionários",
    url: "/dashboard/employees",
    icon: User2,
   
  },
  {
    title: "Utilizadores",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Empresas",
    url: "/dashboard/companies",
    icon: Building2,
   
  },
  {
    title: "Equipamentos",
    url: "/dashboard/equipment",
    icon: Hammer,
 
  },

  {
    title: "Configurações",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Veiculos",
    url: "/dashboard/cars",
    icon: Car,
  },
   {
    title: "Analitycs",
    url: "/dashboard/analytics",
    icon: ChartNoAxesCombined ,
  },
];

export const adminOnlyPaths: string[] = allNavItems
  .filter((item) => Boolean(item.requiresGlobalAdmin))
  .map((item) => item.url);
