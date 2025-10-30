"use client";

import { useState } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useTypeEquipment } from "@/infrastructure/hooks/useTypeEquipment";
import { TypeEquipment } from "@/infrastructure/schema/schema-type-equipment";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TypeEquipmentCreate } from "./type-equipment-create";
import { TypeEquipmentView } from "./type-equipment-view";
import { TypeEquipmentModals } from "./type-equipment-modals";

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
      const date = row.getValue("createdAt") as Date;
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    },
  },
];

interface TypeEquipmentTableProps {
  mockData?: TypeEquipment[];
}

export function TypeEquipmentTable({ mockData }: TypeEquipmentTableProps) {
  const { data: typeEquipment = [], isLoading } = useTypeEquipment();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTypeEquipment, setSelectedTypeEquipment] = useState<TypeEquipment | undefined>();

  // Use mock data if provided, otherwise use API data
  const data = mockData || typeEquipment;

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleView = (typeEquipment: TypeEquipment) => {
    setSelectedTypeEquipment(typeEquipment);
    setIsViewOpen(true);
  };

  const handleEdit = (typeEquipment: TypeEquipment) => {
    setSelectedTypeEquipment(typeEquipment);
    setIsCreateOpen(true);
  };

  const handleDelete = (typeEquipment: TypeEquipment) => {
    setSelectedTypeEquipment(typeEquipment);
    setIsDeleteOpen(true);
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
        enableRowSelection={true}
        includeSelection={true}
        rowActions={[
          {
            label: "Visualizar",
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (typeEquipment) => handleView(typeEquipment),
          },
          {
            label: "Editar",
            icon: <Edit className="h-4 w-4 mr-2" />,
            onClick: (typeEquipment) => handleEdit(typeEquipment),
          },
          {
            label: "Excluir",
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            onClick: (typeEquipment) => handleDelete(typeEquipment),
          },
        ]}
      />

      <TypeEquipmentCreate
        typeEquipment={selectedTypeEquipment}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <TypeEquipmentView
        typeEquipment={selectedTypeEquipment}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />

      <TypeEquipmentModals
        typeEquipmentToDelete={selectedTypeEquipment}
        isOpen={isDeleteOpen}
        onCloseDelete={() => {
          setIsDeleteOpen(false);
          setSelectedTypeEquipment(undefined);
        }}
      />
    </div>
  );
}
