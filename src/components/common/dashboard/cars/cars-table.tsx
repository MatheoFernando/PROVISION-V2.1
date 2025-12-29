"use client";

import { useMemo, useState } from "react";
import { PencilSimple, Trash, X } from "phosphor-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useCars, useCreateGrossCar, useDeleteCar } from "@/infrastructure/hooks/useCars";
import { Car } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { DeleteModal } from "@/components/ui/delete-modal";
import { toast } from "sonner";
import { CarDialog } from "./cars-create";
import { BulkImportDialog } from "@/components/common/base-ui/bulk-import";
import { createGrossCarSchema } from "@/infrastructure/schema/schema-cars";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { z } from "zod";

type CreateGrossCarPayload = z.infer<typeof createGrossCarSchema>;

const columns: ColumnDef<Car>[] = [
  {
    accessorKey: "cod",
    header: "Código",
    size: 50,
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

];

function parseCapacity(value: string | number | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const normalized = value.replace(/[^\d.,-]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

interface CarsTableProps {
  companyId?: string;
  data?: Car[];
  isLoadingOverride?: boolean;
}

export function CarsTable({ companyId: companyIdProp, data, isLoadingOverride }: CarsTableProps = {}) {
  const shouldFetch = !data;
  const deleteCar = useDeleteCar();
  const createGrossCar = useCreateGrossCar();
  const fallbackCompanyId = useAuthStore((s) => s.companyId) ?? "";
  const companyId = companyIdProp ?? fallbackCompanyId;
  const { data: cars = [], isLoading } = useCars({
    enabled: shouldFetch,
    companyId: companyId || undefined,
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | undefined>();
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    setIsCreateOpen(true);
  };

  const handleDelete = (car: Car) => {
    setSelectedCar(car);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCar || !selectedCar.id) return;

    try {
      await deleteCar.mutateAsync(selectedCar.id as string);
      toast.success("Veículo excluído com sucesso!");
      setIsDeleteOpen(false);
      setSelectedCar(undefined);
    } catch (error) {
      toast.error("Erro ao eliminar veículo");
    }
  };

  return (
    <div className="space-y-4">
      <DataTableGeneric
        columns={columns}
        data={cars}
        isLoading={isLoadingOverride ?? isLoading}
        dateKey="createdAt"
        searchKey="cod"
        actionButton={{
          label: "Novo Veículo",
          onClick: () => {
            setSelectedCar(undefined);
            setIsCreateOpen(true);
          },
        }}
        bulkImportButton={{
          label: "Importar viaturas",
          onClick: () => setIsBulkOpen(true),
        }}

        rowActions={[

          {
            label: "Editar",
            icon: <PencilSimple className="h-4 w-4 mr-2" />,
            onClick: (car) => handleEdit(car),
          },
          {
            label: "Eliminar",
            icon: <Trash className="h-4 w-4 mr-2" />,
            onClick: (car) => handleDelete(car),
          },
        ]}
      />



      <CarDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setSelectedCar(undefined);
          } else {
            setIsCreateOpen(true);
          }
        }}
        carToEdit={selectedCar ?? undefined}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCar(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Veículo"
        message="Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita."
        isLoading={deleteCar.isPending}
      />

      <BulkImportDialog<CreateGrossCarPayload>
        isOpen={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        title="Importação em massa de viaturas"
        description="Importe um arquivo CSV conforme o modelo disponível. Todos os campos obrigatórios precisam estar preenchidos."
        templateFilename="modelo-viaturas.csv"
        schema={createGrossCarSchema}
        columns={[
          { key: "cod", label: "Código", required: true },
          { key: "mark", label: "Marca", required: true },
          { key: "model", label: "Modelo", required: true },
          { key: "capacity", label: "Capacidade", required: true },
          { key: "codContainer", label: "Código do container", required: true },
          { key: "geoLocationId", label: "Localização", required: true },
        ]}
        mapRawToInput={(raw) => {
          const capacity = parseCapacity(raw.capacity);
          return {
            cod: raw.cod ?? "",
            mark: raw.mark ?? "",
            model: raw.model ?? "",
            capacity,
            geoLocationId: raw.geoLocationId ?? "",
            codContainer: raw.codContainer ?? "",
            companyId: raw.companyId || companyId,
          };
        }}
        onCreate={async (payload) => {
          await createGrossCar.mutateAsync(payload);
        }}
      />
    </div>
  );
}
