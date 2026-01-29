export interface NavItemData {
  title: string;
  url?: string;
  iconKey?: string;
  items?: NavItemData[];
}

export const adminNavItems: NavItemData[] = [
  { title: "Sidebar.dashboard", url: "/dashboard", iconKey: "GridFour" },
  { title: "Sidebar.modules", url: "/dashboard/modulos", iconKey: "Package" },
  {
    title: "Sidebar.entities",
    url: "/dashboard/entidades",
    iconKey: "UsersFour",
    items: [
      {
        title: "Sidebar.clients",
        url: "/dashboard/clientes",
        iconKey: "Users",
      },
      {
        title: "Sidebar.sites",
        url: "/dashboard/sites",
        iconKey: "MapPinLine",
      },
    ],
  },
  {
    title: "Sidebar.company",
    iconKey: "Buildings",
    url: "/dashboard/empresa",
    items: [
      {
        title: "Sidebar.equipment",
        url: "/dashboard/equipamentos",
        iconKey: "Wrench",
      },
      {
        title: "Sidebar.employees",
        url: "/dashboard/funcionarios",
        iconKey: "UsersFour",
      },
      {
        title: "Sidebar.vehicles",
        url: "/dashboard/veiculos",
        iconKey: "Truck",
      },
      {
        title: "Sidebar.operationalOrganization",
        url: "/dashboard/organizacao-operacional",
        iconKey: "TreeStructure",
      },
    ],
  },
  {
    title: "Sidebar.configuration",
    url: "/dashboard/configuracoes",
    iconKey: "Gear",
    items: [
      {
        title: "Sidebar.usersAndPermissions",
        url: "/dashboard/utilizadores-permissoes",
        iconKey: "UserCircleGear",
      },
      {
        title: "Sidebar.systemDefinitions",
        url: "/dashboard/configuracoes/definicoes-sistema",
        iconKey: "Sliders",
      },
      {
        title: "Sidebar.integrations",
        url: "/dashboard/configuracoes/integracoes",
        iconKey: "PlugsConnected",
      },
      {
        title: "Sidebar.securityAndLogs",
        url: "/dashboard/configuracoes/seguranca-logs",
        iconKey: "ShieldCheck",
      },
      {
        title: "Sidebar.backupAndRestore",
        url: "/dashboard/configuracoes/backup-restauro",
        iconKey: "HardDrives",
      },
    ],
  },
  {
    title: "Sidebar.analytics",
    url: "/dashboard/analises",
    iconKey: "ChartPie",
  },
];

export const globalAdminNavItems: NavItemData[] = [
  { title: "Sidebar.dashboard", url: "/dashboard", iconKey: "GridFour" },
  {
    title: "Sidebar.companys",
    url: "/dashboard/empresa",
    iconKey: "Buildings",
  },
       {
        title: "Sidebar.usersAndPermissions",
        url: "/dashboard/utilizadores-permissoes",
        iconKey: "UserCircleGear",
      },
    {
        title: "Sidebar.modulesAndServices",
        url: "/dashboard/modulos-servicos",
        iconKey: "Package",
      },
];

export const globalAdminAllowedPaths: string[] = [
  "/dashboard/empresa",
  "/dashboard/modulos-servicos",
  "/dashboard/utilizadores-permissoes",
];
