"use client";

import { useState } from "react";
import { PencilSimple, Trash } from "phosphor-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useTypeEquipment } from "@/infrastructure/hooks/useTypeEquipment";
import { TypeEquipment } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TypeEquipmentDialog } from "./type-equipment-create";
import { useDeleteTypeEquipment } from "@/infrastructure/hooks/useTypeEquipment";
import { DeleteModal } from "@/components/ui/delete-modal";

interface SelectedTypeEquipment {
  id: string;
  name: string;
  companyId: string;
  description?: string;
}

const columns: ColumnDef<TypeEquipment>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return name;
    },
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return description || "-";
    },
  },
  {
    accessorKey: "createdAt",
    header: "Data de Criação",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string | undefined;
      if (!date) return "-";
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    },
  },
];



import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";

export function TypeEquipmentTable() {
  const companyId = useAuthStore((state) => state.companyId);
  const { data: typeEquipment = [], isLoading } = useTypeEquipment(companyId ?? undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTypeEquipment, setSelectedTypeEquipment] = useState<SelectedTypeEquipment | undefined>();
  const deleteTypeEquipment = useDeleteTypeEquipment();

  const data = typeEquipment;

  const normalizedTerm = (searchTerm ?? "").trim().toLowerCase();
  const filteredData = data.filter((item) => {
    const name = (item?.name ?? "").toLowerCase();
    const description = (item?.description ?? "").toLowerCase();
    if (!normalizedTerm) return true;
    return name.includes(normalizedTerm) || description.includes(normalizedTerm);
  });

  const handleEdit = (typeEquipment: TypeEquipment) => {
    if (!typeEquipment.id) return;
    setSelectedTypeEquipment({
      id: typeEquipment.id,
      name: typeEquipment.name,
      companyId: typeEquipment.companyId,
      description: typeEquipment.description,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (typeEquipment: TypeEquipment) => {
    if (!typeEquipment.id) return;
    setSelectedTypeEquipment({
      id: typeEquipment.id,
      name: typeEquipment.name,
      companyId: typeEquipment.companyId,
      description: typeEquipment.description,
    });
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTypeEquipment?.id) return;
    try {
      await deleteTypeEquipment.mutateAsync(selectedTypeEquipment.id);
    } catch {
    } finally {
      setIsDeleteOpen(false);
      setSelectedTypeEquipment(undefined);
    }
  };

  const handleCreate = () => {
    setSelectedTypeEquipment(undefined);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-4">
      <DataTableGeneric
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchKey="name"
        actionButton={{
          label: "Novo Tipo de Equipamento",
          onClick: handleCreate,
        }}
        dateKey="createdAt"
        rowActions={[

          {
            label: "Editar",
            icon: <PencilSimple className="h-4 w-4 mr-2" />,
            onClick: (typeEquipment) => handleEdit(typeEquipment),
          },
          {
            label: "Eliminar",
            icon: <Trash className="h-4 w-4 mr-2" />,
            onClick: (typeEquipment) => handleDelete(typeEquipment),
          },
        ]}
      />

      <TypeEquipmentDialog
        typeEquipmentToEdit={selectedTypeEquipment}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Remover tipo de equipamento"
        message={`Tem certeza que deseja remover "${selectedTypeEquipment?.name ?? ""}"?`}
        isLoading={(deleteTypeEquipment as any).isPending}
      />
    </div>
  );
}
