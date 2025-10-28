"use client";

import { useState } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table-generic";
import { useEquipment } from "@/infrastructure/hooks/useEquipment";
import { Equipment } from "@/infrastructure/schema/schema-equipment";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EquipmentCreate } from "./equipment-create";
import { EquipmentView } from "./equipment-view";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useDeleteEquipment } from "@/infrastructure/hooks/useEquipment";
import { toast } from "sonner";

const columns: ColumnDef<Equipment>[] = [
  {
    accessorKey: "serialNumber",
    header: "Número de Série",
    cell: ({ row }) => {
      const serialNumber = row.getValue("serialNumber") as string;
      return <div>{serialNumber}</div>;
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as boolean;
      return status ? (
        <Badge variant="default">Ativo</Badge>
      ) : (
        <Badge variant="secondary">Inativo</Badge>
      );
    },
  },
  {
    accessorKey: "siteId",
    header: "Site",
    cell: ({ row }) => {
      const siteId = row.getValue("siteId") as string;
      return <div>{siteId}</div>;
    },
  },
  {
    accessorKey: "typeEquipmentId",
    header: "Tipo de Equipamento",
    cell: ({ row }) => {
      const typeEquipmentId = row.getValue("typeEquipmentId") as string;
      return <div>{typeEquipmentId}</div>;
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

interface EquipmentTableProps {
  mockData?: Equipment[];
}

export function EquipmentTable({ mockData }: EquipmentTableProps) {
  const { data: equipment = [], isLoading } = useEquipment();
  const deleteEquipment = useDeleteEquipment();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | undefined>();

  const data = mockData || equipment;

  const filteredData = data.filter((item) =>
    item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mark.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsViewOpen(true);
  };

  const handleEdit = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsCreateOpen(true);
  };

  const handleDelete = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEquipment) return;

    try {
      await deleteEquipment.mutateAsync(selectedEquipment.id);
      toast.success("Equipamento excluído com sucesso!");
      setIsDeleteOpen(false);
      setSelectedEquipment(undefined);
    } catch (error) {
      toast.error("Erro ao excluir equipamento");
    }
  };

  const handleCreate = () => {
    setSelectedEquipment(undefined);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-4">
      <DataTableGeneric
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchKey="serialNumber"
        actionButton={{
          label: "Novo Equipamento",
          onClick: handleCreate,
        }}
        enableRowSelection={true}
        includeSelection={true}
        rowActions={[
          {
            label: "Visualizar",
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (equipment) => handleView(equipment),
          },
          {
            label: "Editar",
            icon: <Edit className="h-4 w-4 mr-2" />,
            onClick: (equipment) => handleEdit(equipment),
          },
          {
            label: "Excluir",
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            onClick: (equipment) => handleDelete(equipment),
          },
        ]}
      />

      <EquipmentCreate
        equipment={selectedEquipment}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EquipmentView
        equipment={selectedEquipment}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedEquipment(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Equipamento"
        message="Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita."
        isLoading={deleteEquipment.isPending}
      />
    </div>
  );
}
