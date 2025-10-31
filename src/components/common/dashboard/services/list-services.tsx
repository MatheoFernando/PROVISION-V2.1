"use client";

import { useState, useMemo } from "react";
import { Edit, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { EditService } from "./edit-service";
import { useUpdateModule, useDeleteModule } from "@/infrastructure/hooks/useModules";
import { type ModuleSchema } from "@/infrastructure/schema/schema-module";
import { CreateService } from "./create-service";
import { DeleteModal } from "@/components/ui/delete-modal";


interface ListServicesProps {
  services: ModuleSchema[];
  isGlobalAdmin: boolean;
}

export function ListServices({ services }: ListServicesProps) {
  const [editingService, setEditingService] = useState<ModuleSchema | null>(null);
  const [associateService, setAssociateService] = useState<ModuleSchema | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ModuleSchema | null>(null);
  const updateModuleMutation = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();
  const [processing, setProcessing] = useState<{ id?: string; action?: 'delete' | 'toggle' | 'assign' } | null>(null);

  function handleEdit(service: ModuleSchema) {
    setEditingService(service);
  }

  function handleDeleteClick(service: ModuleSchema) {
    setDeleteTarget(service);
  }

  function handleAssign(service: ModuleSchema) {
    setProcessing({ id: service.id, action: 'assign' });
    setAssociateService(service);
  }

  function handleToggleActive(service: ModuleSchema) {
    const payload: Partial<ModuleSchema> & { id: string } = {
      id: service.id!,
      status: !service.status,
    };
    setProcessing({ id: service.id, action: 'toggle' });
    updateModuleMutation.mutate(payload, {
      onSettled: () => setProcessing(null),
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setProcessing({ id: deleteTarget.id, action: 'delete' });
    deleteModuleMutation.mutate(deleteTarget.id!, {
      onSettled: () => {
        setProcessing(null);
        setDeleteTarget(null);
      },
    });
  }

  const columns = useMemo<ColumnDef<ModuleSchema>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Descrição",
        cell: ({ row }) => (
          <div className="truncate">
            {row.getValue("description") || "-"}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const rawStatus = row.getValue("status") as unknown;
          const isActive = typeof rawStatus === 'string'
            ? rawStatus.toLowerCase() === 'true' || rawStatus === '1'
            : Boolean(rawStatus);
          return (
            <Badge
              className={`${isActive ? "bg-green-200 text-green-600" : "bg-orange-200 text-red-600"} `}
              variant={isActive ? "default" : "destructive"}
            >
              {isActive ? "Ativo" : "Inativo"}
            </Badge>
          );
        },
      },
     
    ],
    []
  );

  const rowActions = [
    {
      label: 'Editar',
      icon: <Edit className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
      onClick: handleEdit,
      variant: 'ghost' as const,
    },
    {
      label: 'Excluir',
      icon: <Trash2 className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
      onClick: handleDeleteClick,
      variant: 'ghost' as const,
    },
   
  ];

  return (
    <div>
      <div>
        <DataTableGeneric
          data={services}
          columns={columns}
          searchKey="name"
          placeholder="Pesquisar serviços..."
          rowActions={rowActions}
          includeSelection={true}
          actionButton={{
            label: 'Novo Serviços',
            component: <CreateService />
          } as any}
        />
      </div>
      {editingService && (
        <EditService
          service={editingService}
          open={!!editingService}
          onOpenChange={(open) => {
            if (!open) setEditingService(null);
          }}
        />
      )}

  

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={processing?.action === 'delete'}
        title="Eliminar serviço"
        message={`Tem certeza que deseja eliminar o serviço ${deleteTarget?.name} ? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
