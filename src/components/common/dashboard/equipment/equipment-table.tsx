"use client";

import { useState } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useEquipment } from "@/infrastructure/hooks/useEquipment";
import { Equipment } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EquipmentView } from "./equipment-view";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useDeleteEquipment } from "@/infrastructure/hooks/useEquipment";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EquipmentCreatePage from "./equipment-create";

const columns: ColumnDef<Equipment>[] = [
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
  {
    accessorKey: "createdAt",
    header: "Data de Criação",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    },
  },
];

export function EquipmentTable() {
  const { data: equipment = [], isLoading } = useEquipment();
  const deleteEquipment = useDeleteEquipment();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<
    Equipment | undefined
  >();

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
        isLoading={isLoading}
        searchKey="serialNumber"
        actionButton={{
          label: "Novo Equipamento",
          onClick: () => {
            setSelectedEquipment(undefined);
            setIsCreateOpen(true);
          },
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
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            onClick: (equipment) => handleDelete(equipment),
          },
        ]}
      />

      <EquipmentView
        equipment={selectedEquipment}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <EquipmentCreatePage
            id={selectedEquipment?.id}
            initialData={selectedEquipment as any}
            onSuccess={() => { setIsCreateOpen(false); setSelectedEquipment(undefined); }}
            onCancel={() => { setIsCreateOpen(false); setSelectedEquipment(undefined); }}
          />
        </DialogContent>
      </Dialog>

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
