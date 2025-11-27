"use client";

import { useMemo, useState } from "react";
import { Edit, Trash2, X } from "lucide-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useCars, useCreateGrossCar, useDeleteCar } from "@/infrastructure/hooks/useCars";
import { Car } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { DeleteModal } from "@/components/ui/delete-modal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CarsCreate } from "./cars-create";
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
  const { data: cars = [], isLoading } = useCars({ enabled: shouldFetch });
  const deleteCar = useDeleteCar();
  const createGrossCar = useCreateGrossCar();
  const fallbackCompanyId = useAuthStore((s) => s.companyId) ?? "";
  const companyId = companyIdProp ?? fallbackCompanyId;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | undefined>();
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const dataset = data ?? cars;
  const filteredCars = useMemo(() => {
    if (!companyId) return dataset;
    return dataset.filter((car) => car.companyId === companyId);
  }, [dataset, companyId]);
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
      toast.error("Erro ao excluir veículo");
    }
  };

  return (
    <div className="space-y-4">
      <DataTableGeneric
        columns={columns}
        data={filteredCars}
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
        enableRowSelection={true}
        includeSelection={true}
        rowActions={[
     
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

   

      <Drawer
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsCreateOpen(true);
            return;
          }
          setIsCreateOpen(false);
          setSelectedCar(undefined);
        }}
        direction="right"
      >
        <DrawerContent className="h-full w-full sm:max-w-xl">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DrawerTitle className="text-2xl font-bold text-foreground">
                    {selectedCar ? "Editar Veículo" : "Novo Veículo"}
                  </DrawerTitle>
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <CarsCreate
                id={selectedCar?.id}
                initialData={selectedCar as any}
                onSuccess={() => { setIsCreateOpen(false); setSelectedCar(undefined); }}
                onCancel={() => { setIsCreateOpen(false); setSelectedCar(undefined); }}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

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
        ]}
        mapRawToInput={(raw) => {
          const capacity = parseCapacity(raw.capacity);
          return {
            cod: raw.cod ?? "",
            mark: raw.mark ?? "",
            model: raw.model ?? "",
            capacity,
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
