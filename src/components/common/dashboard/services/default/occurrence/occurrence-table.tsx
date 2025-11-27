"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit, Trash2, MoreHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { OccurrenceDialog } from "./occurrence-view";
import { OccurrenceCreate } from "./occurrence-create";
import { useDeleteOccurrenceMutation } from "@/infrastructure/hooks/useOccurrences";
import type { Occurrence } from "@/infrastructure/schema/schema-occurrence";
import { useEmployees } from "@/infrastructure/hooks/useEmployees";
import { useEquipment } from "@/infrastructure/hooks/useEquipment";
import { useSites } from "@/infrastructure/hooks/useSites";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { DeleteModal } from "@/components/ui/delete-modal";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

function ActionsButtons({ occurrence }: { occurrence: Occurrence }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const deleteMutation = useDeleteOccurrenceMutation();
  const handleConfirmDelete = () => {
    deleteMutation.mutate(occurrence.id!, {
      onSuccess: () => setIsDeleteOpen(false),
    });
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
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => setIsDialogOpen(true)}
            className="cursor-pointer"
          >
            <Eye className="size-4 mr-2" />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsEditOpen(true)}
            className="cursor-pointer"
          >
            <Edit className="size-4 mr-2 text-blue-600" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="size-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <OccurrenceDialog
        occurrence={occurrence}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <Drawer
        open={isEditOpen}
        onOpenChange={(open) => setIsEditOpen(open)}
        direction="right"
      >
        <DrawerContent className="h-full w-full sm:max-w-xl">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DrawerTitle className="text-2xl font-bold text-foreground">
                    Editar Ocorrência
                  </DrawerTitle>
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <OccurrenceCreate
                id={occurrence.id}
                initialData={occurrence as any}
                onSuccess={() => setIsEditOpen(false)}
                onCancel={() => setIsEditOpen(false)}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Excluir Ocorrência"
        message={`Tem certeza que deseja excluir a ocorrência ${occurrence.cod}?`}
      />
    </>
  );
}

const formatHour = (value?: string) => {
  if (!value) return "--";
  if (value.includes("T") && Number.isNaN(Date.parse(value))) {
    const fallback = value.includes(":") ? value : `${value}:00`;
    return fallback.slice(0, 5);
  }
  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${new Date().toISOString().slice(0, 10)}T${value}`);
  if (Number.isNaN(date.getTime())) {
    const fallback = value.includes(":") ? value : `${value}:00`;
    return fallback.slice(0, 5);
  }
  return date
    .toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(".", ":");
};

const createOccurrenceColumns = (): ColumnDef<Occurrence>[] => [
  {
    accessorKey: "cod",
    header: "Código",
    size: 40,
    cell: ({ row }) => <div className="font-medium">{row.original.cod}</div>,
  },

  {
    accessorKey: "equipmentId",
    header: "Equipamento",
    cell: ({ row }) => <div>{row.getValue<string>("equipmentId")}</div>,
  },
  {
    accessorKey: "employeeId",
    header: "Funcionário",
    cell: ({ row }) => <div>{row.getValue<string>("employeeId")}</div>,
  },
  {
    accessorKey: "siteId",
    header: "Site",
    size: 120,
    cell: ({ row }) => <div>{row.getValue<string>("siteId")}</div>,
  },

  {
    accessorKey: "correctiveAction",
    header: "Ação Corretiva",
    cell: ({ row }) => (
      <div
        className="max-w-[200px] truncate"
        title={row.original.correctiveAction}
      >
        {row.original.correctiveAction}
      </div>
    ),
  },
  {
    accessorKey: "gravity",
    header: "Gravidade",
    cell: ({ row }) => {
      const gravity = row.original.gravity;
      const variant =
        gravity === "Alta"
          ? "destructive"
          : gravity === "Média"
          ? "default"
          : "secondary";
      return (
        <Badge
          variant={variant}
          className={
            variant === "destructive"
              ? "bg-red-500 text-white"
              : variant === "default"
              ? "bg-orange-200 text-red-500"
              : variant === "secondary"
              ? " bg-green-500 text-white"
              : "bg-gray-200 text-gray-500"
          }
        >
          {gravity}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const isOpen = row.original.status === "Ativo";
      return (
        <Badge
          variant={isOpen ? "default" : "secondary"}
          className={
            isOpen ? "bg-green-500 text-white" : "bg-orange-200 text-red-500"
          }
        >
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorFn: (row) => formatHour(row.time),
    header: "Horário",
    size: 40,
    cell: ({ row }) => {
      const hhmm = formatHour(row.original.time);
      return <div className="text-center">{hhmm}</div>;
    },
  },

  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => <ActionsButtons occurrence={row.original} />,
  },
];

interface OccurrenceTableProps {
  data: Occurrence[];
  isLoading?: boolean;
  onCreateClick?: () => void;
}

export function OccurrenceTable({
  data,
  isLoading,
}: OccurrenceTableProps) {
  const companyId = useAuthStore((s) => s.companyId || undefined);
  const { data: employees = [] } = useEmployees(companyId);
  const { data: equipments = [] } = useEquipment();
  const { data: sites = [] } = useSites();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  const employeeById = React.useMemo(() => {
    const map: Record<string, string> = {};
    (employees as any[]).forEach((e: any) => {
      if (e?.id) map[e.id] = e.fullName || e.name || "";
    });
    return map;
  }, [employees]);

  const equipmentById = React.useMemo(() => {
    const map: Record<string, string> = {};
    (equipments as any[]).forEach((e: any) => {
      if (e?.id) map[e.id] = e.cod || e.model || e.mark || "";
    });
    return map;
  }, [equipments]);

  const siteById = React.useMemo(() => {
    const map: Record<string, string> = {};
    (sites as any[]).forEach((s: any) => {
      if (s?.id) map[s.id] = s.name || "";
    });
    return map;
  }, [sites]);

  const resolvedData = React.useMemo(() => {
    return (data || []).map((o) => ({
      ...o,
      employeeId: employeeById[o.employeeId || ""] || o.employeeId,
      equipmentId: equipmentById[o.equipmentId || ""] || o.equipmentId,
      siteId: siteById[o.siteId || ""] || o.siteId,
    }));
  }, [data, employeeById, equipmentById, siteById]);

  return (
    <div className="w-full">
      <DataTableGeneric
        data={resolvedData}
        columns={createOccurrenceColumns()}
        searchKey="cod"
        placeholder="Pesquisar..."
        dateKey="createdAt"
        enableRowSelection={true}
        includeSelection={true}
        isLoading={isLoading}
        actionButton={{
          label: "Nova Ocorrência",
          onClick: () => setIsCreateOpen(true),
        }}
      />
      <Drawer
        open={isCreateOpen}
        onOpenChange={(open) => setIsCreateOpen(open)}
        direction="right"
      >
        <DrawerContent className="h-full w-full sm:max-w-xl">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DrawerTitle className="text-2xl font-bold text-foreground">
                    Nova Ocorrência
                  </DrawerTitle>
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <OccurrenceCreate
                onSuccess={() => setIsCreateOpen(false)}
                onCancel={() => setIsCreateOpen(false)}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
