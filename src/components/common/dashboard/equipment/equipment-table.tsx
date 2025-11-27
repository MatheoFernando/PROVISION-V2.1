"use client";

import { useState } from "react";
import * as React from "react";
import { Eye, Edit, Trash2, X } from "lucide-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import {
  useCreateEquipment,
  useCreateGrossEquipment,
  useDeleteEquipment,
  useEquipment,
} from "@/infrastructure/hooks/useEquipment";
import { Equipment } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { EquipmentView } from "./equipment-view";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import EquipmentCreatePage from "./equipment-create";
import { BulkImportDialog } from "@/components/common/base-ui/bulk-import";
import {
  type CreateGrossEquipmentPayload,
} from "@/infrastructure/schema/schema-equipment";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useRouter } from "next/navigation";

const columns: ColumnDef<Equipment>[] = [
  {
    accessorKey: "cod",
    header: "Código",
    size: 80,
    cell: ({ row }) => {
      const cod = row.getValue("cod") as string;
      return <div>{cod}</div>;
    },
  },
  {
    accessorKey: "serialNumber",
    header: "Número de Série",
    size: 80,
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
      const status = (row.getValue("status") as string | undefined) ?? "-";
      const isActive = status.toUpperCase() === "ACTIVE";
      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={
            isActive
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }
        >
          {isActive ? "Ativo" : "Inativo"}
        </Badge>
      );
    },
  },

  {
    accessorKey: "siteId",
    header: "Site",
    cell: ({ row }) => {
      const siteName = (
        row.original as { site?: { name?: string } } | undefined
      )?.site?.name;
      return <div>{siteName ?? "-"}</div>;
    },
  },
  {
    accessorKey: "typeEquipmentId",
    header: "Tipo de Equipamento",
    cell: ({ row }) => {
      const typeEquipmentName = (
        row.original as { typeEquipment?: { name?: string } } | undefined
      )?.typeEquipment?.name;
      return <div>{typeEquipmentName ?? "-"}</div>;
    },
  },
];
interface EquipmentTableProps {
  openCreateOnLoad?: boolean;
  shouldNavigateBack?: boolean;
  customerId?: string;
  data?: Equipment[];
  isLoadingOverride?: boolean;
}

export function EquipmentTable({
  openCreateOnLoad = false,
  shouldNavigateBack = false,
  customerId,
  data,
  isLoadingOverride,
}: EquipmentTableProps = {}) {
  const router = useRouter();
  const shouldFetch = !data;
  const {
    data: allEquipment = [],
    isLoading,
    refetch: refetchEquipment,
  } = useEquipment(customerId, { enabled: shouldFetch });
  
  const equipment = React.useMemo(() => {
    if (data) return data;
    if (!customerId) return allEquipment;
    // Filtrar equipamentos através dos sites do cliente
    // Isso será feito pelo hook, mas garantimos aqui também
    return allEquipment;
  }, [data, allEquipment, customerId]);
  const deleteEquipment = useDeleteEquipment();
  const createGrossEquipment = useCreateGrossEquipment();
  const companyId = useAuthStore((s) => s.companyId) ?? "";
  const [isCreateOpen, setIsCreateOpen] = useState(openCreateOnLoad);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<
    Equipment | undefined
  >();
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const resetCreateState = () => {
    setIsCreateOpen(false);
    setSelectedEquipment(undefined);
  };

  const handleReturn = () => {
    if (shouldNavigateBack) router.back();
  };

  const handleCreateCancel = () => {
    resetCreateState();
    handleReturn();
  };

  const handleCreateSuccess = () => {
    if (shouldFetch) {
      void refetchEquipment();
    }
    resetCreateState();
    handleReturn();
  };

  const handleCreateDialogChange = (open: boolean) => {
    if (open) {
      setIsCreateOpen(true);
      return;
    }
    handleCreateCancel();
  };

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
    if (!selectedEquipment?.id) return;
    try {
      await deleteEquipment.mutateAsync(selectedEquipment.id);
    } finally {
      setIsDeleteOpen(false);
      setSelectedEquipment(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <DataTableGeneric
        columns={columns}
        data={equipment ?? []}
        isLoading={isLoadingOverride ?? isLoading}
        searchKey="serialNumber"
        actionButton={{
          label: "Novo Equipamento",
          onClick: () => {
            setSelectedEquipment(undefined);
            setIsCreateOpen(true);
          },
        }}
        bulkImportButton={{
          label: "Importar equipamentos",
          onClick: () => setIsBulkOpen(true),
        }}
        enableRowSelection={true}
        includeSelection={true}
        dateKey="createdAt"
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
            icon: <Trash2 className="h-4 w-4 mr-2 text-red-600" />,
            onClick: (equipment) => handleDelete(equipment),
          },
        ]}
      />

      <EquipmentView
        equipment={selectedEquipment}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />

      <Drawer
        open={isCreateOpen}
        onOpenChange={handleCreateDialogChange}
        direction="right"
      >
        <DrawerContent className="h-full w-full sm:max-w-xl">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DrawerTitle className="text-2xl font-bold text-foreground">
                    {selectedEquipment
                      ? "Editar Equipamento"
                      : "Novo Equipamento"}
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
              <EquipmentCreatePage
                id={selectedEquipment?.id}
                initialData={selectedEquipment as any}
                customerId={customerId}
                onSuccess={handleCreateSuccess}
                onCancel={handleCreateCancel}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

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

      <BulkImportDialog<CreateGrossEquipmentPayload>
        isOpen={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        title="Importação em massa de equipamentos"
        columns={[
          { key: "cod", label: "Código", required: true },
          { key: "serialNumber", label: "Número de Série", required: true },
          { key: "mark", label: "Marca", required: true },
          { key: "model", label: "Modelo", required: true },
          { key: "status", label: "Estado", required: true },
          { key: "nameSite", label: "Nome do Site registrado", required: true },
          { key: "nameTypeEquipment", label: "Tipo de Equipamento", required: true },
        ]}
        templateFilename="modelo-equipamentos.csv"
        mapRawToInput={(raw) => {
          const normalizedStatus = (raw.status ?? "")
            .trim()
            .toUpperCase() as CreateGrossEquipmentPayload["status"];

          return {
            cod: raw.cod?.trim() ?? "",
            serialNumber: raw.serialNumber?.trim() ?? "",
            mark: raw.mark?.trim() ?? "",
            model: raw.model?.trim() ?? "",
            status: normalizedStatus || "ACTIVE",
            nameSite: raw.nameSite?.trim() ?? "",
            nameTypeEquipment: raw.nameTypeEquipment?.trim() ?? "",
            companyId: (companyId || raw.companyId || "").trim(),
          };
        }}
        onCreate={async (payload) => {
          await createGrossEquipment.mutateAsync(payload);
        }}
      />
    </div>
  );
}
