"use client";

import { useState } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table-generic";
import { useCars } from "@/infrastructure/hooks/useCars";
import { Car } from "@/infrastructure/schema/schema-cars";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CarsCreate } from "./cars-create";
import { CarsView } from "./cars-view";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useDeleteCar } from "@/infrastructure/hooks/useCars";
import { toast } from "sonner";

const columns: ColumnDef<Car>[] = [
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

interface CarsTableProps {
  mockData?: Car[];
}

export function CarsTable({ mockData }: CarsTableProps) {
  const { data: cars = [], isLoading } = useCars();
  const deleteCar = useDeleteCar();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | undefined>();

  // Use mock data if provided, otherwise use API data
  const data = mockData || cars;

  const filteredData = data.filter((item) =>
    item.cod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mark.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (car: Car) => {
    setSelectedCar(car);
    setIsViewOpen(true);
  };

  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    setIsCreateOpen(true);
  };

  const handleDelete = (car: Car) => {
    setSelectedCar(car);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCar) return;

    try {
      await deleteCar.mutateAsync(selectedCar.id);
      toast.success("Veículo excluído com sucesso!");
      setIsDeleteOpen(false);
      setSelectedCar(undefined);
    } catch (error) {
      toast.error("Erro ao excluir veículo");
    }
  };

  const handleCreate = () => {
    setSelectedCar(undefined);
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
          label: "Novo Veículo",
          onClick: handleCreate,
        }}
        enableRowSelection={true}
        includeSelection={true}
        rowActions={[
          {
            label: "Visualizar",
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (car) => handleView(car),
          },
          {
            label: "Editar",
            icon: <Edit className="h-4 w-4 mr-2" />,
            onClick: (car) => handleEdit(car),
          },
          {
            label: "Excluir",
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            onClick: (car) => handleDelete(car),
          },
        ]}
      />

      <CarsCreate
        car={selectedCar}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <CarsView
        car={selectedCar}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCar(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Veículo"
        message="Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita."
        isLoading={deleteCar.isPending}
      />
    </div>
  );
}
