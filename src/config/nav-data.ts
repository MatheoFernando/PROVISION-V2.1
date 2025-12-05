export interface NavItemData {
  title: string;
  url?: string;
  requiresGlobalAdmin?: boolean;
  iconKey?: string;
  items?: NavItemData[];
}

export const getNavData = (isGlobalAdmin: boolean): NavItemData[] => [
  { title: "Dashboard", url: "/dashboard", iconKey: "GridFour" },
  { title: "Módulos", url: "/dashboard/service", iconKey: "Package" },
  {
    title: "Entidades",
    url: "/dashboard/entities",
    iconKey: "UsersFour",
    items: [
      {
        title: "Clientes",
        url: "/dashboard/customers",
        iconKey: "Users",
      },
      {
        title: "Sites",
        url: "/dashboard/sites",
        iconKey: "MapPinLine",
      },

    ],
  },
  {
    title: "Empresa",
    url: "/dashboard/customers",
    iconKey: "Buildings",
    items: [
      {
        title: "Equipamentos",
        url: "/dashboard/equipment",
        iconKey: "Wrench",
      },
      {
        title: "Funcionários",
        url: "/dashboard/employees",
        iconKey: "UsersFour",
      },
      {
        title: "Veículos",
        url: "/dashboard/cars",
        iconKey: "Truck",
      },
      {
        title: "Organização Operacional",
        url: "/dashboard/operational-organization",
        iconKey: "TreeStructure",
        items: [
          {
            title: "Áreas",
            url: "/dashboard/operational-organization/areas",
            iconKey: "CirclesThreePlus",
          },
          {
            title: "Sectores",
            url: "/dashboard/operational-organization/sectors",
            iconKey: "MapTrifold",
          },
          {
            title: "Zonas",
            url: "/dashboard/operational-organization/zones",
            iconKey: "MapTrifold",
          },
          {
            title: "Sites/ Postos",
            url: "/dashboard/operational-organization/sites-postos",
            iconKey: "MapPinLine",
          },
        ],
      },
    ],
  },

  {
    title: "Configurações",
    url: "/dashboard/setting",
    iconKey: "Gear",
    items: [
      {
        title: "Utilizadores e Permissões",
        url: "/dashboard/settings/users-permissions",
        iconKey: "UserCircleGear",

      },
      {
        title: "Módulos e Serviços",
        url: "/dashboard/settings/modules-services",
        iconKey: "Package",
      },
      {
        title: "Definições do Sistema",
        url: "/dashboard/settings/system-settings",
        iconKey: "Sliders",
      },
      {
        title: "Integrações",
        url: "/dashboard/settings/integrations",
        iconKey: "PlugsConnected",
      },
      {
        title: "Segurança e Logs",
        url: "/dashboard/settings/security-logs",
        iconKey: "ShieldCheck",
      },
      {
        title: "Backup e Restauro",
        url: "/dashboard/settings/backup-restore",
        iconKey: "HardDrives",
      },
    ],
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    iconKey: "ChartPie",
  },
];


export const navData: NavItemData[] = getNavData(false);

export const adminOnlyPaths: string[] = [];
