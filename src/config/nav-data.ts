export interface NavItemData {
  title: string;
  url?: string;
  requiresGlobalAdmin?: boolean;
  iconKey?: string;
  items?: NavItemData[];
}

export const getNavData = (isGlobalAdmin: boolean): NavItemData[] => [
  { title: "Dashboard", url: "/dashboard", iconKey: "SquaresFour" },
  { title: "Modulo", url: "/dashboard/service", iconKey: "Package" },
  ...(isGlobalAdmin
    ? []
    : [
        {
          title: "Empresa",
          url: "/dashboard/customers",
          iconKey: "Buildings",
          items: [
            {
              title: "Clientes",
              url: "/dashboard/customers",
              iconKey: "Users",
            },
            {
              title: "Funcionários",
              url: "/dashboard/employees",
              iconKey: "Users",
            },
              {
                title: "Veículos",
                url: "/dashboard/car",
                iconKey: "Car",
              },
              {
                title: "Sites",
                url: "/dashboard/sites",
                iconKey: "MapPinLine",
              },
              {
                title: "Equipamentos",
                url: "/dashboard/equipment",
                iconKey: "Wrench",
              },

          ],
        },
      ]),
  {
    title: "Configurações",
    url: "/dashboard/settings",
    iconKey: "Gear",
    items: [
      {
        title: "Utilizadores",
        url: "/dashboard/users",
        iconKey: "Users",
      },
      ...(isGlobalAdmin ? [{ title: "Empresas", url: "/dashboard/companies", iconKey: "Buildings" }] : []),
    
    ],
  },
  {
    title: "Analitycs",
    url: "/dashboard/analytics",
    iconKey: "ChartPie",
  },
];


export const navData: NavItemData[] = getNavData(false);

export const adminOnlyPaths: string[] = [];
