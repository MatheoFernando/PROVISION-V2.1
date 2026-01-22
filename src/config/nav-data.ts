export interface NavItemData {
  title: string;
  url?: string;
  requiresGlobalAdmin?: boolean;
  iconKey?: string;
  items?: NavItemData[];
}

export const getNavData = (isGlobalAdmin: boolean): NavItemData[] => {
  const commonNav: NavItemData[] = [
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
          url: "/dashboard/configuracoes/utilizadores-permissoes",
          iconKey: "UserCircleGear",
        },
        {
          title: "Sidebar.modulesAndServices",
          url: "/dashboard/configuracoes/modulos-servicos",
          iconKey: "Package",
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

  if (isGlobalAdmin) {
  
    return [
      { title: "Sidebar.dashboard", url: "/dashboard", iconKey: "GridFour" },
      {
       
            title: "Sidebar.companys",
            url: "/dashboard/empresa",
            iconKey: "Buildings",
        
      },
  
    ];
  } else {
   
    return [...commonNav];
  }
};

export const navData: NavItemData[] = getNavData(false);

// Rotas permitidas APENAS para super admin
export const superAdminOnlyPaths: string[] = [
  "/dashboard/empresa",
 
];

// Rotas bloqueadas para super admin (só não-admin pode acessar)
export const blockedForSuperAdminPaths: string[] = [
  "/dashboard/modulos",
  "/dashboard/entidades",
  "/dashboard/clientes",
  "/dashboard/sites",
  "/dashboard/equipamentos",
  "/dashboard/funcionarios",
  "/dashboard/veiculos",
  "/dashboard/organizacao-operacional",
  "/dashboard/configuracoes/modulos-servicos",
  "/dashboard/configuracoes/definicoes-sistema",
  "/dashboard/configuracoes/integracoes",
  "/dashboard/configuracoes/seguranca-logs",
  "/dashboard/configuracoes/backup-restauro",
  "/dashboard/analises",
   "/dashboard/configuracoes/utilizadores-permissoes",
];
export const adminOnlyPaths = superAdminOnlyPaths;
