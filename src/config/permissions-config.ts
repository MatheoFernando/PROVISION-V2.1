
export interface PermissionAction {
    label: string;
    value: string; // e.g., 'view', 'create', 'edit', 'delete'
}

export interface PermissionModule {
    id: string; // e.g., 'users', 'equipment'
    label: string;
    actions: PermissionAction[];
}

export const COMMON_ACTIONS: PermissionAction[] = [
    { label: 'Ver', value: 'view' },
    { label: 'Criar', value: 'create' },
    { label: 'Editar', value: 'edit' },
    { label: 'Eliminar', value: 'delete' },
];

export const PERMISSION_MODULES: PermissionModule[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        actions: [{ label: 'Ver', value: 'view' }],
    },
    {
        id: 'users',
        label: 'Utilizadores',
        actions: COMMON_ACTIONS,
    },
    {
        id: 'employees',
        label: 'Funcionários',
        actions: COMMON_ACTIONS,
    },
    {
        id: 'equipment',
        label: 'Equipamentos',
        actions: COMMON_ACTIONS,
    },
    {
        id: 'containers',
        label: 'Contentores',
        actions: COMMON_ACTIONS,
    },
    {
        id: 'vehicles',
        label: 'Veículos',
        actions: COMMON_ACTIONS,
    },
    {
        id: 'customers',
        label: 'Clientes',
        actions: COMMON_ACTIONS,
    },
    {
        id: 'sites',
        label: 'Sites',
        actions: COMMON_ACTIONS,
    },
    {
        id: 'occurrences',
        label: 'Ocorrências',
        actions: COMMON_ACTIONS,
    },
    {
        id: 'rsu',
        label: 'RSU',
        actions: COMMON_ACTIONS,
    },
    {
        id: 'supervision',
        label: 'Supervisão',
        actions: COMMON_ACTIONS,
    },
    {
        id: 'company',
        label: 'Empresa',
        actions: [{ label: 'Ver', value: 'view' }, { label: 'Editar', value: 'edit' }],
    },
    {
        id: 'settings',
        label: 'Configurações',
        actions: [{ label: 'Ver', value: 'view' }, { label: 'Editar', value: 'edit' }],
    },
];
