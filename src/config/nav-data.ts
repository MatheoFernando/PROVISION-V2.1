export interface NavItemData {
    title: string;
    url?: string;
    requiresGlobalAdmin?: boolean;
    iconKey?: string;
    items?: NavItemData[];
}

export const navData: NavItemData[] = [
    { title: "Dashboard", url: "/dashboard", iconKey: "SquaresFour" },
    { title: "Modulo", url: "/dashboard/service", iconKey: "Package" },
    {
        title: "Empresas",
        url: "/dashboard/customers",
        iconKey: "Buildings",
    },
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
           
        ],
    },
    {
        title: "Analitycs",
        url: "/dashboard/analytics",
        iconKey: "ChartPie",
    },
];

export const adminOnlyPaths: string[] = navData
    .filter((item) => Boolean(item.requiresGlobalAdmin) && item.url)
    .map((item) => item.url as string);
