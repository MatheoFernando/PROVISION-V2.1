import {
  type LucideIcon,
  LayoutDashboard ,
  Users,
  Building2,
  Settings,
  Briefcase,
  UserCheck,
  ChartNoAxesCombined 
} from "lucide-react";

export interface BaseNavItem {
  title: string;
  url?: string;
  requiresGlobalAdmin?: boolean;
  icon?: LucideIcon;
  items?: BaseNavItem[];
}

export const allNavItems: BaseNavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard  },
  { title: "Modulo", url: "/dashboard/service", icon: Briefcase },
  {
    title: "Clientes",
    url: "/dashboard/customers",
    icon: UserCheck,

  },

  {
    title: "Configurações",
    url: "/dashboard/settings",
    icon: Settings,
    items: [
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
    ],
  },

   {
    title: "Analitycs",
    url: "/dashboard/analytics",
    icon: ChartNoAxesCombined ,
  },
];

export const adminOnlyPaths: string[] = allNavItems
  .filter((item) => Boolean(item.requiresGlobalAdmin) && item.url)
  .map((item) => item.url as string);
