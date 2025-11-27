"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  Trash2,
  User,
  Building,
  Settings,
  Shield,
  UserX,
  XIcon,
  Eye,
  Edit,
  Plus,
  Power,
  ExternalLink,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { IconDotsVertical } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useCompaniesQuery } from "@/infrastructure/hooks/useCompanies";
import type {
  User as UserEntity,
  Company,
} from "@/infrastructure/types/domain";
import { useRouter } from "next/navigation";
import CreateUserDialog from "@/components/common/dashboard/users/users-create";

type User = UserEntity;

function ActionsButtons({
  item,
  tabType,
}: {
  item: any;
  tabType: "users" | "companies";
}) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const handleAction = (action: string) => {
    const itemName =
      tabType === "users"
        ? item?.phone ?? "Utilizador"
        : item?.businessName ?? "Empresa";

    switch (action) {
      case "permissions":
        setIsDrawerOpen(true);
        break;
      case "remove":
        toast.success(`Removendo ${itemName}`);
        break;
      case "disable":
        const actionText =
          tabType === "users"
            ? "desabilitando usuário"
            : "desabilitando empresa";
        toast.success(`${actionText} ${itemName}`);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => handleAction("permissions")}>
            <Shield className="size-4 mr-2" />
            Permissões
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("disable")}>
            {tabType === "users" ? (
              <UserX className="size-4 mr-2" />
            ) : (
              <Building className="size-4 mr-2" />
            )}
            Desabilitar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => handleAction("remove")}
          >
            <Trash2 className="size-4 mr-2" />
            Remover
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PermissionsDrawer
        item={item}
        tabType={tabType}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>
  );
}

// Componente para permissões de configuração
interface PermissionState {
  view: boolean;
  edit: boolean;
  create: boolean;
  delete: boolean;
  habilitate: boolean;
}

interface PermissionItem {
  key: keyof PermissionState;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const permissionAliasMap: Record<string, keyof PermissionState> = {
  view: "view",
  read: "view",
  consultar: "view",
  edit: "edit",
  update: "edit",
  alterar: "edit",
  create: "create",
  add: "create",
  register: "create",
  delete: "delete",
  remove: "delete",
  destroy: "delete",
  enable: "habilitate",
  activate: "habilitate",
  habilitate: "habilitate",
  habilitar: "habilitate",
};

function createPermissionStateTemplate(): PermissionState {
  return {
    view: false,
    edit: false,
    create: false,
    delete: false,
    habilitate: false,
  };
}

const permissionItemsConfig: PermissionItem[] = [
  {
    key: "view",
    label: "Ver",
    description: "Permite visualizar informações e relatórios do módulo.",
    icon: Eye,
  },
  {
    key: "edit",
    label: "Editar",
    description: "Autoriza ajustes em registros existentes.",
    icon: Edit,
  },
  {
    key: "create",
    label: "Criar",
    description: "Libera a criação de novos registros.",
    icon: Plus,
  },
  {
    key: "delete",
    label: "Deletar",
    description: "Concede permissão para excluir registros.",
    icon: Trash2,
  },
  {
    key: "habilitate",
    label: "Habilitar",
    description: "Define a capacidade de ativar ou suspender recursos.",
    icon: Power,
  },
];

function PermissionsDrawer({
  item,
  tabType,
  isOpen,
  onOpenChange,
}: {
  item: any;
  tabType: "users" | "companies";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const itemName =
    tabType === "users"
      ? item?.phone ?? "Utilizador"
      : item?.businessName ?? "Empresa";
  const [permissionState, setPermissionState] = React.useState<PermissionState>(
    createPermissionStateTemplate
  );
  const [hasChanges, setHasChanges] = React.useState(false);
  const itemIdentifier = React.useMemo(() => {
    if (!item) return "";
    if (item?.id) return String(item.id);
    if (item?.phone) return String(item.phone);
    if (item?.businessName) return String(item.businessName);
    if (item?.nif) return String(item.nif);
    return "";
  }, [item?.id, item?.phone, item?.businessName, item?.nif]);
  const normalizedPermissions = React.useMemo(() => {
    if (!Array.isArray(item?.permissions)) return [];
    return (item.permissions as string[]).map((permission) =>
      permission?.toLowerCase?.() ?? permission
    );
  }, [item?.permissions]);

  const status = React.useMemo(() => {
    if (!item) return "inactive";
    const isActive =
      tabType === "users" ? Boolean(item?.status) : Boolean(item?.status);
    return isActive ? "active" : "inactive";
  }, [item, tabType]);

  const departmentName = React.useMemo(() => {
    if (!item) return "Sem departamento";
    if (tabType === "users") {
      return item?.employee?.department?.name ?? "Sem departamento";
    }
    return item?.department?.name ?? item?.department ?? "Sem departamento";
  }, [item, tabType]);

  const displayName = React.useMemo(() => {
    if (tabType === "users") {
      return item?.employee?.fullName ?? item?.phone ?? "Utilizador";
    }
    return item?.businessName ?? "Empresa";
  }, [item, tabType]);

  const secondaryIdentifier = React.useMemo(() => {
    if (tabType === "users") {
      return item?.phone ?? "Telefone não informado";
    }
    return item?.nif ?? "NIF não informado";
  }, [item, tabType]);

  const statusLabel = status === "active" ? "Ativo" : "Inativo";

  React.useEffect(() => {
    if (!isOpen || !itemIdentifier) return;

    const baseState = createPermissionStateTemplate();
    normalizedPermissions.forEach((permission) => {
      const mappedKey = permissionAliasMap[permission];
      if (mappedKey) {
        baseState[mappedKey] = true;
      }
    });

    setPermissionState((prev) => {
      const hasDifference = (Object.keys(baseState) as Array<
        keyof PermissionState
      >).some((key) => prev[key] !== baseState[key]);
      return hasDifference ? baseState : prev;
    });
    setHasChanges(false);
  }, [isOpen, itemIdentifier, normalizedPermissions]);

  const handleSave = () => {
    const activePermissions = Object.entries(permissionState)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key);

    console.log(`Salvando permissões para ${tabType} ID: ${item?.id}`, {
      permissions: activePermissions,
      status,
    });

    toast.success(`Permissões salvas para ${itemName}`);
    setHasChanges(false);
    onOpenChange(false);
  };

  const handlePermissionToggle = (key: keyof PermissionState) => {
    setPermissionState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent
        className={isMobile ? "h-[85vh]" : "h-[100vh] w-[400px] max-w-[90vw]"}
      >
        <DrawerHeader className="gap-1 border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>Permissões</DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                Gerencie o acesso
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-2">
              {!hasChanges && (
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard/profile")}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                >
                  <span>Ver perfil</span>
                  <ExternalLink className="size-4" />
                </Button>
              )}
              {hasChanges && (
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500/80 px-6 py-2 rounded transition cursor-pointer"
                >
                  Salvar Permissões
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="ghost" className="size-8">
                  <XIcon className="size-4 cursor-pointer" />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-4">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar className="size-12">
                <AvatarImage src={item?.photo} alt={displayName} />
                <AvatarFallback>
                  {displayName?.slice(0, 2)?.toUpperCase?.() ?? "US"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col">
                <span className="font-semibold leading-tight">
                  {displayName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {secondaryIdentifier}
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <Badge>{statusLabel}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border rounded-lg overflow-hidden">
              <div className="space-y-2 col-span-1 flex gap-4 border-b p-4">
                <Label className="text-sm font-semibold text-muted-foreground uppercase border-r pr-4">
                  Departamento
                </Label>
                <Badge
                  variant="outline"
                  className="w-fit text-xs uppercase tracking-wide"
                >
                  {departmentName}
                </Badge>
              </div>

              <div className="space-y-3 col-span-1 p-4">
                <span className="text-sm font-semibold text-muted-foreground mb-4">
                  Permissões
                </span>
                <div className="space-y-3">
                  {permissionItemsConfig.map(
                    ({ key, label, description, icon: Icon }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3 flex-1 pr-3">
                          <div className="flex items-center justify-center size-8 rounded-md bg-blue-50 shrink-0">
                            <Icon className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-tight">
                              {label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={`permission-${key}`}
                          checked={permissionState[key]}
                          onCheckedChange={() => handlePermissionToggle(key)}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:hover:bg-green-700"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

       
      </DrawerContent>
    </Drawer>
  );
}

const createCompanyColumns = (): ColumnDef<Company>[] => [
  {
    accessorKey: "businessName",
    header: "Nome da Empresa",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.businessName}</div>
    ),
  },

  {
    accessorKey: "role",
    header: "Função",
  },
  {
    accessorKey: "permissions",
    header: "Permissões",
  },

  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <ActionsButtons item={row.original} tabType="companies" />
    ),
  },
];

function Management() {
  const { data: companies, isLoading: companiesLoading } = useCompaniesQuery();
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = React.useState(false);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento</h1>
      </div>

      <DataTableGeneric
        data={companies ?? []}
        columns={createCompanyColumns()}
        searchKey="businessName"
        placeholder="Pesquisar empresas..."
        enableRowSelection={true}
        dateKey="createdAt"
        includeSelection={true}
        isLoading={companiesLoading}
        actionButton={{
          label: "Adicionar Utilizador",
          onClick: () => setIsCreateUserDialogOpen(true),
        }}
      />

      <CreateUserDialog
        open={isCreateUserDialogOpen}
        onOpenChange={setIsCreateUserDialogOpen}
      />
    </div>
  );
}

export default Management;
