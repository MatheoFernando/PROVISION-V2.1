"use client";

import { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Edit, Trash2 } from "lucide-react";
import {
  useDeleteCompanyModuleMutation,
} from "@/infrastructure/hooks/useCompanies";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import type { CompanyModuleWithDetails } from "@/infrastructure/schema/schema-company-module";
import {
  CompanyModuleDialog,
  type CompanyModuleDialogState,
} from "./company-module-dialog";

interface ListServicesProps {
  services: CompanyModuleWithDetails[];
  isLoading?: boolean;
}

interface CompanyModuleRow extends CompanyModuleWithDetails {
  status?: string | boolean;
}

export function ListServices({ services, isLoading }: ListServicesProps) {
  const [deleteTarget, setDeleteTarget] =
    useState<CompanyModuleWithDetails | null>(null);
  const deleteCompanyModuleMutation = useDeleteCompanyModuleMutation();
  const [dialogState, setDialogState] = useState<CompanyModuleDialogState | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const { isGlobalAdmin } = useAuthStore();

  const handleDeleteClick = useCallback(
    (service: CompanyModuleWithDetails) => {
      setDeleteTarget(service);
    },
    []
  );

  function confirmDelete() {
    if (!deleteTarget?.id) return;
    setIsDeleting(true);
    deleteCompanyModuleMutation.mutate(deleteTarget.id, {
      onSettled: () => {
        setIsDeleting(false);
        setDeleteTarget(null);
      },
    });
  }

  const getAssociationStatus = useCallback((service: CompanyModuleRow) => {
    const rawStatus =
      (service.status as unknown) ?? (service.isActive as unknown);
    if (typeof rawStatus === "string") {
      const normalized = rawStatus.toLowerCase();
      return normalized === "true" || normalized === "1";
    }
    return Boolean(rawStatus);
  }, []);

  const columns = useMemo<ColumnDef<CompanyModuleRow>[]>(
    () => [
      {
        accessorKey: "module.name",
        header: "Serviço",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.module?.name ?? "-"}</div>
        ),
      },
      {
        accessorKey: "module.description",
        header: "Descrição",
        cell: ({ row }) => (
          <div className="truncate">
            {row.original.module?.description || "-"}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
          const isActive = getAssociationStatus(row.original);
          return (
            <Badge
              className={`${
                isActive
                  ? "bg-transparent text-green-600"
                  : "bg-orange-200 text-red-600"
              } `}
              variant={isActive ? "default" : "destructive"}
            >
              {isActive ? "Ativo" : "Inativo"}
            </Badge>
          );
        },
      }
     
    ],
    [getAssociationStatus]
  );

  const filteredServices = useMemo(() => services, [services]);

  const openAssociationDialog = useCallback(
    (service: CompanyModuleWithDetails) => {
      if (!service.id && !service.companyId && !service.moduleId) return;
      setDialogState({
        associationId: service.id ?? null,
        defaultCompanyId: service.companyId ?? service.company?.id ?? undefined,
        defaultModuleId: service.moduleId ?? service.module?.id ?? undefined,
        defaultStatus: getAssociationStatus(service),
      });
    },
    [getAssociationStatus]
  );

  const rowActions = useMemo(() => {
    if (!isGlobalAdmin) return [];
    return [
      {
        label: "Editar",
        icon: <Edit className="size-4" />,
        onClick: openAssociationDialog,
      },
      {
        label: "Desassociar",
        icon: <Trash2 className="size-4" />,
        onClick: handleDeleteClick,
        variant: "ghost" as const,
      },
    ];
  }, [handleDeleteClick, isGlobalAdmin, openAssociationDialog]);

  return (
    <div>
      <div>
        <DataTableGeneric
          data={filteredServices}
          columns={columns}
          dateKey="createdAt"
          isLoading={isLoading}
          placeholder="Pesquisar serviços..."
          rowActions={rowActions as any}
          actionButton={
            isGlobalAdmin
              ? {
                  label: "Associação de serviços",
                  onClick: () =>
                    setDialogState({
                      associationId: null,
                      defaultStatus: true,
                    }),
                }
              : undefined
          }
        />
      </div>

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Eliminar serviço"
        message={`Tem certeza que deseja eliminar o serviço ${deleteTarget?.module?.name} ? Esta ação não pode ser desfeita.`}
      />

      {isGlobalAdmin && (
        <CompanyModuleDialog
          open={Boolean(dialogState)}
          onOpenChange={(open) => {
            if (!open) setDialogState(null);
          }}
          associationId={dialogState?.associationId}
          defaultCompanyId={dialogState?.defaultCompanyId}
          defaultModuleId={dialogState?.defaultModuleId}
          defaultStatus={dialogState?.defaultStatus}
        />
      )}
    </div>
  );
}
