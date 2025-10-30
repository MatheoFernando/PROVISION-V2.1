"use client";

import { useState } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";

import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useContainers } from "@/infrastructure/hooks/useContainers";
import { Container } from "@/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ContainersView } from "./containers-view";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useDeleteContainer } from "@/infrastructure/hooks/useContainers";
import { toast } from "sonner";
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
    accessorKey: "mark",
    header: "Marca",
    cell: ({ row }) => {
      const mark = row.getValue("mark") as string;
      return <div>{mark}</div>;
    },
  },
  {
    accessorKey: "model",
    header: "Modelo",
    cell: ({ row }) => {
      const model = row.getValue("model") as string;
      return <div>{model}</div>;
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
    accessorKey: "containerId",
    header: "Container",
    cell: ({ row }) => {
      const containerId = row.getValue("containerId") as string;
      return <div>{containerId}</div>;
    },
  },
  {
    accessorKey: "geoLocationEntityId",
    header: "Localização",
    cell: ({ row }) => {
      const geoLocationEntityId = row.getValue("geoLocationEntityId") as string;
      return <div>{geoLocationEntityId}</div>;
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

  const filteredData = containers.filter((item) =>
    item.cod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mark.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (container: Container) => {
    setSelectedContainer(container);
    setIsViewOpen(true);
  };

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
      toast.success("Container excluído com sucesso!");
      setIsDeleteOpen(false);
      setSelectedContainer(undefined);
    } catch (error) {
      toast.error("Erro ao excluir container");
    }
  };

  const handleCreate = () => {
    setSelectedContainer(undefined);
    setIsCreateOpen(true);
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
          onClick: () => router.push("/dashboard/containers/create"),
        }}
        enableRowSelection={true}
        includeSelection={true}
        rowActions={[
          {
            label: "Visualizar",
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (container) => handleView(container),
          },
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

 

      <ContainersView
        container={selectedContainer}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedContainer(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Container"
        message="Tem certeza que deseja excluir este container? Esta ação não pode ser desfeita."
        isLoading={deleteContainer.isPending}
      />
    </div>
  );
}
