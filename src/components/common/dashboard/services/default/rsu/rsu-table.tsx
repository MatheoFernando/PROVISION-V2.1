"use client";
// Refactored RsuTable

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,

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
import type { Rsu } from "@/infrastructure/types/domain";
import { RsuDialog } from "./rsu-create";
import { RsuDrawer } from "./rsu-view";
import { ContainerCreateDialog } from "./container-create-dialog";
import { useDeleteRsuMutation } from "@/infrastructure/hooks/useRsu";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
// Removed local PERMISSIONS constant



interface ActionsButtonsProps {
  rsu: Rsu;
  onEdit?: (rsu: Rsu) => void;
  canEdit: boolean;
  canDelete: boolean;
}

function ActionsButtons({ rsu, onEdit, canEdit, canDelete }: ActionsButtonsProps) {
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
          {canEdit && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onEdit?.(rsu)}
            >
              <Edit className="mr-2 size-4" />
              Editar
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {canDelete && (
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={() => setIsDeleteOpen(true)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="mr-2 size-4" />
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <RsuDrawer
        rsu={rsu}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onEdit={(rsu) => {
          setIsDrawerOpen(false);
          onEdit?.(rsu);
        }}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar RSU"
        message={`Tem certeza que deseja excluir o RSU ${rsu.cod}?`}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

interface RsuTableProps {
  data: Rsu[];
  isLoading?: boolean;
  onDateRangeChange?: (range?: DateRange) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status?: string) => void;
}

export function RsuTable({
  data,
  isLoading,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange,
}: RsuTableProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedRsu, setSelectedRsu] = React.useState<Rsu | null>(null);
  const [isContainerDialogOpen, setIsContainerDialogOpen] = React.useState(false);
  const canAccess = useAuthStore((s) => s.canAccess);

  const canView = canAccess("rsu", 1);
  const canCreate = canAccess("rsu", 2);
  const canEdit = canAccess("rsu", 3);
  const canDelete = canAccess("rsu", 4);

  const columns: ColumnDef<Rsu>[] = React.useMemo(
    () => [
      {
        accessorKey: "cod",
        header: "Código",
        cell: ({ row }) => <span>{row.original.cod}</span>,
      },
      {
        accessorKey: "quantity",
        header: "Quantidade",
        size: 60,
        cell: ({ row }) => <span>{row.original.quantity}</span>,
      },
      {
        id: "container",
        header: "Contentor",
        cell: ({ row }) => {
          const container = row.original.container;
          return <span>{container ? `${container.cod ?? ""} ${container.name ?? ""}`.trim() : "—"}</span>;
        },
      },
      {
        id: "car",
        header: "Viatura",
        cell: ({ row }) => {
          const car = row.original.car;
          return <span>{car ? `${car.cod ?? ""} ${car.mark ?? ""}`.trim() : "—"}</span>;
        },
      },
      {
        id: "employee",
        header: "Funcionário",
        cell: ({ row }) => <span>{row.original.employee?.fullName ?? "—"}</span>,
      },
      {
        id: "site",
        header: "Site",
        cell: ({ row }) => <span>{row.original.site?.name ?? "—"}</span>,
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
          const status = row.original.status;
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
        id: "actions",
        header: "Ações",
        size: 48,
        cell: ({ row }) => (
          <ActionsButtons
            rsu={row.original}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={(rsu) => {
              setSelectedRsu(rsu);
              setIsFormOpen(true);
            }}
          />
        ),
      },
    ],
    [canEdit, canDelete]
  );

  const handleCreate = () => {
    setSelectedRsu(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedRsu(null);
  };

  if (!canView) return null;

  return (
    <div className="space-y-4">

      <DataTableGeneric
        data={data}
        columns={columns}
        searchKey="cod"
        placeholder="Pesquisar por código ou descrição..."
        isLoading={isLoading}
        dateKey="createdAt"
        onDateRangeChange={onDateRangeChange}
        actionButton={
          canCreate
            ? {
                label: "Novo RSU",
                onClick: handleCreate,
              }
            : undefined
        }
        secondaryActionButton={{
          label: "Contentor",
          onClick: () => setIsContainerDialogOpen(true)
        }}
        statusOptions={[
          { label: "Pendente", value: "Pendente" },
          { label: "Em andamento", value: "Em andamento" },
          { label: "Finalizado", value: "Finalizado" },
        ]}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
      />

      <RsuDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        rsuToEdit={selectedRsu ?? undefined}
        onSuccess={handleCloseForm}
      />

      <ContainerCreateDialog
        open={isContainerDialogOpen}
        onOpenChange={setIsContainerDialogOpen}
      />
    </div>
  );
}


