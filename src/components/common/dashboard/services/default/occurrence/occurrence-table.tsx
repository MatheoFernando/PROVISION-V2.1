"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
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
import { OccurrenceDialog } from "./occurrence-dialog";
import { useDeleteOccurrenceMutation } from "@/infrastructure/hooks/useOccurrences";
import { useTypeOccurrences } from "@/infrastructure/hooks/useTypeOccurrences";
import type { Occurrence } from "@/infrastructure/schema/schema-occurrence";
import type { TypeOccurrence } from "@/infrastructure/schema/schema-type-occurrence";
import { useEmployees } from "@/infrastructure/hooks/useEmployees";
import { useEquipment } from "@/infrastructure/hooks/useEquipment";
import { useSites } from "@/infrastructure/hooks/useSites";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useRouter } from "next/navigation";

function ActionsButtons({ occurrence }: { occurrence: Occurrence }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const deleteMutation = useDeleteOccurrenceMutation();
  const router = useRouter();

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir esta ocorrência?")) {
      deleteMutation.mutate(occurrence.id!);
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
            onClick={() =>
              router.push(
                `/dashboard/service/occorrence/create?id=${occurrence.id}`
              )
            }
            className="cursor-pointer"
          >
            <Edit className="size-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            variant="destructive"
            onClick={handleDelete}
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
    </>
  );
}

const createOccurrenceColumns = (
  typeOccurrences: TypeOccurrence[]
): ColumnDef<Occurrence>[] => [
  {
    accessorKey: "cod",
    header: "Código",
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
              ? "bg-green-500 text-white"
              : "bg-orange-200 text-red-500"
          }
        >
          {gravity}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
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
    accessorKey: "time",
    header: "Horário",
    cell: ({ row }) => {
      const t = row.original.time || "";
      const hhmm = t.includes("T") ? t.slice(11, 16) : t.slice(0, 5);
      return <div className="text-center">{hhmm}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.original.createdAt || "").toLocaleDateString("pt-BR")}
      </div>
    ),
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
  onCreateClick,
}: OccurrenceTableProps) {
  const { data: typeOccurrences } = useTypeOccurrences();
  const companyId = useAuthStore((s) => s.companyId || undefined);
  const { data: employees = [] } = useEmployees(companyId);
  const { data: equipments = [] } = useEquipment();
  const { data: sites = [] } = useSites();
  const router = useRouter();

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
        columns={createOccurrenceColumns(typeOccurrences ?? [])}
        searchKey="cod"
        placeholder="Pesquisar ocorrências..."
        enableRowSelection={true}
        includeSelection={true}
        isLoading={isLoading}
        actionButton={{
          label: "Nova Ocorrência",
          onClick: () => router.push("/dashboard/service/occurrence/create"),
        }}
      />
    </div>
  );
}
