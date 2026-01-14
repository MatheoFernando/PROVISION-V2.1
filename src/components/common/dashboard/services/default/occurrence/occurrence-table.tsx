"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit, MoreHorizontal } from "lucide-react";
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
import { OccurrenceViewDrawer } from "./occurrence-view";
import { OccurrenceDialog } from "./occurrence-create";
import { TypeOccurrenceCreateDialog } from "./type-occurrence-create-dialog";
import { useDeleteOccurrenceMutation } from "@/infrastructure/hooks/useOccurrences";
import type { Occurrence } from "@/infrastructure/schema/schema-occurrence";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Trash } from "phosphor-react";
import type { DateRange } from "react-day-picker";

interface ActionsButtonsProps {
  occurrence: Occurrence;
}

function ActionsButtons({ occurrence }: ActionsButtonsProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const deleteMutation = useDeleteOccurrenceMutation();

  const handleConfirmDelete = () => {
    if (occurrence.id) {
      deleteMutation.mutate(occurrence.id, {
        onSuccess: () => setIsDeleteOpen(false),
      });
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
            <Edit className="size-4 mr-2 " />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash className="size-4 mr-2" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <OccurrenceViewDrawer
        occurrence={occurrence}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onEdit={() => {
          setIsDialogOpen(false);
          setIsEditOpen(true);
        }}
      />

      <OccurrenceDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        occurrenceToEdit={occurrence}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Eliminar Ocorrência"
        message={`Tem certeza que deseja excluir a ocorrência ${occurrence.cod}?`}
      />
    </>
  );
}

const formatHour = (value?: string): string => {
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

/** Extended occurrence type with flattened display names for table columns */
interface OccurrenceWithNames extends Occurrence {
  employeeName?: string;
  equipmentName?: string;
  siteName?: string;
}

const createOccurrenceColumns = (): ColumnDef<OccurrenceWithNames>[] => [
  {
    accessorKey: "cod",
    header: "Código",
    size: 40,
    cell: ({ row }) => <div>{row.original.cod}</div>,
  },
  {
    accessorKey: "equipmentName",
    header: "Equipamento",
    cell: ({ row }) => <div>{row.original.equipmentName || "—"}</div>,
  },
  {
    accessorKey: "employeeName",
    header: "Funcionário",
    cell: ({ row }) => <div>{row.original.employeeName || "—"}</div>,
  },
  {
    accessorKey: "siteName",
    header: "Site",
    cell: ({ row }) => <div>{row.original.siteName || "—"}</div>,
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
  onDateRangeChange?: (range?: DateRange) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status?: string) => void;
}

export function OccurrenceTable({
  data,
  isLoading,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange,
}: OccurrenceTableProps) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isTypeOccurrenceDialogOpen, setIsTypeOccurrenceDialogOpen] = React.useState(false);

  const transformedData: OccurrenceWithNames[] = React.useMemo(() => {
    return data.map((occurrence) => ({
      ...occurrence,
      employeeName: occurrence.employees?.fullName,
      equipmentName: occurrence.equipments?.cod,
      siteName: occurrence.sites?.name,
    }));
  }, [data]);

  const handleCreateClick = () => {
    setIsCreateOpen(true);
  };

  return (
    <div className="w-full">
      <DataTableGeneric
        data={transformedData}
        columns={createOccurrenceColumns()}
        searchKey="cod"
        placeholder="Pesquisar..."
        dateKey="createdAt"
        isLoading={isLoading}
        actionButton={{
          label: "Nova Ocorrência",
          onClick: handleCreateClick
        }}
        secondaryActionButton={{
          label: "Tipo de Ocorrência",
          onClick: () => setIsTypeOccurrenceDialogOpen(true)
        }}
        statusOptions={[
          { label: "Ativo", value: "Ativo" },
          { label: "Inativo", value: "Inativo" },
        ]}
        onDateRangeChange={onDateRangeChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
      />

      <OccurrenceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        occurrenceToEdit={undefined}
      />

      <TypeOccurrenceCreateDialog
        open={isTypeOccurrenceDialogOpen}
        onOpenChange={setIsTypeOccurrenceDialogOpen}
      />
    </div>
  );
}
