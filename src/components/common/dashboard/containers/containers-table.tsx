"use client";

import { useState } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";

import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useContainers } from "@/infrastructure/hooks/useContainers";
import { Container } from "@/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreateContainerModal } from "./containers-create-modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useDeleteContainer } from "@/infrastructure/hooks/useContainers";
import { useRouter } from "next/navigation";

const columns: ColumnDef<Container>[] = [
  {
    accessorKey: "cod",
    header: "Código",
    cell: ({ row }) => {
      const cod = row.getValue("cod") as string;
      return <div>{cod}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div>{name}</div>;
    },
  },

  {
    accessorKey: "capacity",
    header: "Capacidade",
    cell: ({ row }) => {
      const capacity = row.getValue("capacity") as number;
      return `${capacity}L`;
    },
  },

  {
    accessorKey: "createdAt",
    header: "Data de Criação",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    },
  },
];

export function ContainersTable() {
  const { data: containers = [], isLoading } = useContainers();
  const router = useRouter();
  const deleteContainer = useDeleteContainer();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<Container | undefined>();

  const containersList: Container[] = Array.isArray(containers)
    ? containers
    : (containers as unknown as { items?: Container[]; data?: Container[] })?.items ??
      (containers as unknown as { items?: Container[]; data?: Container[] })?.data ??
      [];

  const normalizedSearch = searchTerm.toLowerCase();
  const filteredData = containersList.filter((item) =>
    item.cod.toLowerCase().includes(normalizedSearch) ||
    (String((item as any).name ?? "").toLowerCase().includes(normalizedSearch))
  );


  const handleEdit = (container: Container) => {
    setSelectedContainer(container);
    setIsCreateOpen(true);
  };

  const handleDelete = (container: Container) => {
    setSelectedContainer(container);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedContainer || !selectedContainer.id) return;

    try {
      await deleteContainer.mutateAsync(selectedContainer.id as string);
      setIsDeleteOpen(false);
      setSelectedContainer(undefined);
    } catch (error) {}
  };



  return (
    <div className="space-y-4">
      <DataTableGeneric
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchKey="cod"
        actionButton={{
          label: "Novo Container",
          onClick: () => {
            setSelectedContainer(undefined);
            setIsCreateOpen(true);
          },
        }}
        enableRowSelection={true}
        includeSelection={true}
        rowActions={[
          {
            label: "Editar",
            icon: <Edit className="h-4 w-4 mr-2" />,
            onClick: (container) => handleEdit(container),
          },
          {
            label: "Excluir",
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            onClick: (container) => handleDelete(container),
          },
        ]}
      />

 

      <CreateContainerModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        container={selectedContainer}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedContainer(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title={`Excluir Container${(selectedContainer as any)?.name ? `: ${(selectedContainer as any).name}` : ""}`}
        message={`Tem certeza que deseja excluir ${(selectedContainer as any)?.name ?? selectedContainer?.cod ?? "este container"}? Esta ação não pode ser desfeita.`}
        isLoading={deleteContainer.isPending}
      />
    </div>
  );
}
