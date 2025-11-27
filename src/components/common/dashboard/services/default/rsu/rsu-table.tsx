"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useEmployees } from "@/infrastructure/hooks/useEmployees";
import { useSites } from "@/infrastructure/hooks/useSites";
import { useCars } from "@/infrastructure/hooks/useCars";
import { useContainers } from "@/infrastructure/hooks/useContainers";
import type { Rsu } from "@/infrastructure/types/domain";
import { RsuCreate } from "./rsu-create";
import { RsuDrawer } from "./rsu-view";
import { useDeleteRsuMutation } from "@/infrastructure/hooks/useRsu";

const STATUS_OPTIONS = [
  { value: "Pendente", label: "Pendente" },
  { value: "Em andamento", label: "Em andamento" },
  { value: "Finalizado", label: "Finalizado" },
] as const;

interface ActionsButtonsProps {
  rsu: Rsu;
  onEdit?: (rsu: Rsu) => void;
}

function ActionsButtons({ rsu, onEdit }: ActionsButtonsProps) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const deleteMutation = useDeleteRsuMutation();

  const handleDelete = () => {
    deleteMutation.mutate(rsu.id!, {
      onSuccess: () => setIsDeleteOpen(false),
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Eye className="mr-2 size-4" />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onEdit?.(rsu)}
          >
            <Edit className="mr-2 size-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={() => setIsDeleteOpen(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-2 size-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RsuDrawer rsu={rsu} isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Excluir RSU"
        message={`Tem certeza que deseja excluir o RSU ${rsu.cod}?`}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

const createColumns = (maps: {
  employeeById: Record<string, string>;
  siteById: Record<string, string>;
  carById: Record<string, string>;
  containerById: Record<string, string>;
  onEdit?: (rsu: Rsu) => void;
}): ColumnDef<Rsu>[] => [
  {
    accessorKey: "cod",
    header: "Código",
    cell: ({ row }) => <span className="font-medium">{row.getValue("cod")}</span>,
  },
  {
    accessorKey: "quantity",
    header: "Quantidade",
    size: 60,
    cell: ({ row }) => <span>{row.getValue("quantity")}</span>,
  },
  {
    id: "container",
    header: "Contentor",
    cell: ({ row }) => (
      <span>{maps.containerById[row.original.containerId || ""] || "—"}</span>
    ),
  },
  {
    id: "car",
    header: "Viatura",
    cell: ({ row }) => (
      <span>{maps.carById[row.original.carId || ""] || "—"}</span>
    ),
  },
  {
    id: "employee",
    header: "Funcionário",
    cell: ({ row }) => (
      <span>{maps.employeeById[row.original.employeeId || ""] || "—"}</span>
    ),
  },
  {
    id: "site",
    header: "Site",
    cell: ({ row }) => (
      <span>{maps.siteById[row.original.siteId || ""] || "—"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const isDone = status === "Finalizado";
      return (
        <Badge
          variant={isDone ? "default" : "secondary"}
          className={isDone ? "bg-emerald-500" : "bg-amber-100 text-amber-800"}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row }) => {
      const value = row.getValue("createdAt") as string | undefined;
      return <span>{formatDate(value)}</span>;
    },
  },
  {
    id: "actions",
    header: "Ações",
    size: 48,
    cell: ({ row }) => (
      <ActionsButtons
        rsu={row.original}
        onEdit={maps.onEdit}
      />
    ),
  },
];

interface RsuTableProps {
  data: Rsu[];
  isLoading?: boolean;
  onDateRangeChange?: (range?: DateRange) => void;
  siteFilter?: string;
  statusFilter?: string;
  onSiteFilterChange?: (siteId?: string) => void;
  onStatusFilterChange?: (status?: string) => void;
}

export function RsuTable({
  data,
  isLoading,
  onDateRangeChange,
}: RsuTableProps) {
  const companyId = useAuthStore((state) => state.companyId || undefined);
  const { data: employees = [] } = useEmployees(companyId);
  const { data: sites = [] } = useSites();
  const { data: cars = [] } = useCars();
  const { data: containers = [] } = useContainers();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedRsu, setSelectedRsu] = React.useState<Rsu | null>(null);

  const employeeById = React.useMemo(() => {
    const map: Record<string, string> = {};
    (employees as any[]).forEach((employee: any) => {
      if (employee?.id) map[employee.id] = employee.fullName || employee.name || "";
    });
    return map;
  }, [employees]);

  const siteById = React.useMemo(() => {
    const map: Record<string, string> = {};
    (sites as any[]).forEach((site: any) => {
      if (site?.id) map[site.id] = site.name || site.cod || "";
    });
    return map;
  }, [sites]);

  const carById = React.useMemo(() => {
    const map: Record<string, string> = {};
    (cars as any[]).forEach((car: any) => {
      if (car?.id) map[car.id] = `${car.cod ?? ""} ${car.mark ?? ""}`.trim();
    });
    return map;
  }, [cars]);

  const containerById = React.useMemo(() => {
    const map: Record<string, string> = {};
    (containers as any[]).forEach((container: any) => {
      if (container?.id) {
        map[container.id] = `${container.cod ?? ""} ${container.mark ?? container.model ?? ""}`.trim();
      }
    });
    return map;
  }, [containers]);

  const columns = React.useMemo(
    () =>
      createColumns({
        employeeById,
        siteById,
        carById,
        containerById,
        onEdit: (rsu) => {
          setSelectedRsu(rsu);
          setIsFormOpen(true);
        },
      }),
    [employeeById, siteById, carById, containerById]
  );

  const handleCreate = () => {
    setSelectedRsu(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedRsu(null);
  };


  return (
    <div className="space-y-4">
      
      <DataTableGeneric
        data={data}
        columns={columns}
        searchKey="cod"
        placeholder="Pesquisar por código ou descrição..."
        includeSelection
        isLoading={isLoading}
        dateKey="createdAt"
        onDateRangeChange={onDateRangeChange}
        actionButton={{
          label: "Novo RSU",
          onClick: handleCreate,
        }}
      />

      <Drawer open={isFormOpen} onOpenChange={(open) => (open ? setIsFormOpen(true) : handleCloseForm())} direction="right">
        <DrawerContent className="h-full w-full sm:max-w-xl">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DrawerTitle className="text-2xl font-bold text-foreground">
                    {selectedRsu ? "Editar RSU" : "Novo RSU"}
                  </DrawerTitle>
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => setIsFormOpen(false)}
                  >
                    <X className="size-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <RsuCreate
                id={selectedRsu?.id}
                initialData={selectedRsu ?? undefined}
                onSuccess={handleCloseForm}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-PT");
}

