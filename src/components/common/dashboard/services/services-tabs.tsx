"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useModules, useDeleteModule } from "@/infrastructure/hooks/useModules";
import type { ModuleSchema } from "@/infrastructure/schema/schema-module";
import type { CompanyModuleWithDetails } from "@/infrastructure/schema/schema-company-module";
import { ListServices } from "./list-services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CreateService } from "./create-service";
import { PencilSimple, Trash } from "phosphor-react";
import { DeleteModal } from "@/components/ui/delete-modal";
import { EditService } from "./edit-service";
import { Link2 } from "lucide-react";
import {
  CompanyModuleDialog,
  type CompanyModuleDialogState,
} from "./company-module-create";
import { useTranslations } from "next-intl";

interface AdminServicesTabsProps {
  companyModules: CompanyModuleWithDetails[];
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function AdminServicesTabs({
  companyModules,
  statusFilter,
  onStatusFilterChange,
  isLoading,
}: AdminServicesTabsProps) {
  const t = useTranslations("ServicesManagement");
  const {
    data: modules = [],
    isLoading: isLoadingModules,
  } = useModules();
  const deleteModuleMutation = useDeleteModule();
  const [editingModule, setEditingModule] = useState<ModuleSchema | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ModuleSchema | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [companyModuleDialog, setCompanyModuleDialog] =
    useState<CompanyModuleDialogState | null>(null);

  const moduleColumns = useMemo<ColumnDef<ModuleSchema>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("fields.service"),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name") || "N/D"}</div>
        ),
      },
      {
        accessorKey: "description",
        header: t("fields.description"),
        cell: ({ row }) => (
          <div className="truncate">
            {row.getValue("description") || "N/D"}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t("fields.status"),
        cell: ({ row }) => {
          const rawStatus = row.getValue("status") as unknown;
          const isActive =
            typeof rawStatus === "string"
              ? rawStatus.toLowerCase() === "true" || rawStatus === "1"
              : Boolean(rawStatus);

          return (
            <Badge
              className={`${isActive
                ? "bg-transparent text-green-600"
                : "bg-orange-200 text-red-600"
                } `}
              variant={isActive ? "default" : "destructive"}
            >
              {isActive ? t("fields.active") : t("fields.inactive")}
            </Badge>
          );
        },
      },
    ],
    [t],
  );

  function handleConfirmDelete() {
    if (!deleteTarget?.id) return;
    setIsProcessingDelete(true);
    deleteModuleMutation.mutate(deleteTarget.id, {
      onSettled: () => {
        setIsProcessingDelete(false);
        setDeleteTarget(null);
      },
    });
  }

  return (
    <Tabs defaultValue="modules" className="space-y-4">
      <TabsList>
        <TabsTrigger value="modules" className="cursor-pointer">{t("tabs.module")}</TabsTrigger>
        <TabsTrigger value="company-modules" className="cursor-pointer">{t("tabs.companyModules")}</TabsTrigger>
      </TabsList>

      <TabsContent value="modules" className="space-y-4">

        <DataTableGeneric
          data={modules}
          columns={moduleColumns}
          searchKey="name"
          dateKey="createdAt"
          isLoading={isLoadingModules}
          placeholder={t("placeholders.searchModule")}
          actionButton={{
            label: t("buttons.createModule"),
            component: <CreateService />,
          }}
          rowActions={[
            {
              label: t("buttons.edit"),
              icon: <PencilSimple className="h-4 w-4 mr-2" />,
              onClick: (module: ModuleSchema) => {
                setEditingModule(module);
              },
            },
            {
              label: t("buttons.associate"),
              icon: <Link2 className="h-4 w-4 mr-2" />,
              onClick: (module: ModuleSchema) => {
                if (!module.id) return;
                setCompanyModuleDialog({
                  associationId: null,
                  defaultModuleId: module.id,
                  defaultStatus: true,
                });
              },
            },
            {
              label: t("buttons.delete"),
              icon: <Trash className="h-4 w-4 mr-2" />,
              onClick: (module: ModuleSchema) => {
                setDeleteTarget(module);
              },
            },
          ]}
        />

        {editingModule && (
          <EditService
            service={editingModule}
            open={!!editingModule}
            onOpenChange={(open) => {
              if (!open) setEditingModule(null);
            }}
          />
        )}

        <DeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          isLoading={isProcessingDelete}
          title={t("titles.deleteService")}
          message={deleteTarget?.name
            ? `${t("deleteModal.message")} ${deleteTarget.name}? ${t("deleteModal.permanentAction")}`
            : `${t("deleteModal.message")}? ${t("deleteModal.permanentAction")}`}
        />
      </TabsContent>

      <TabsContent value="company-modules" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("filters.statusFilter")}
            </Label>
            <Select
              value={statusFilter ?? "all"}
              onValueChange={(value) =>
                onStatusFilterChange(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-40 h-9 text-sm cursor-pointer">
                <SelectValue placeholder={t("placeholders.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">{t("filters.all")}</SelectItem>
                <SelectItem value="true" className="cursor-pointer">{t("fields.active")}</SelectItem>
                <SelectItem value="false" className="cursor-pointer">{t("fields.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ListServices services={companyModules} isLoading={isLoading} showCompanyColumn={true} />
      </TabsContent>

      <CompanyModuleDialog
        open={Boolean(companyModuleDialog)}
        onOpenChange={(open) => {
          if (!open) setCompanyModuleDialog(null);
        }}
        associationId={companyModuleDialog?.associationId}
        defaultCompanyId={companyModuleDialog?.defaultCompanyId}
        defaultModuleId={companyModuleDialog?.defaultModuleId}
        defaultStatus={companyModuleDialog?.defaultStatus}
      />
    </Tabs >
  );
}


