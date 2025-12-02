"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { EditService } from "./edit-service";
import { useDeleteModule } from "@/infrastructure/hooks/useModules";
import { type ModuleSchema } from "@/infrastructure/schema/schema-module";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Trash } from "phosphor-react";
import { Edit, Link2 } from "lucide-react";
import { useModules } from "@/infrastructure/hooks/useModules";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCreateCompanyModuleMutation } from "@/infrastructure/hooks/useCompanies";
import { CompanySelect } from "@/components/common/base-ui/selects/company-select";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { Input } from "@/components/ui/input";

interface ListServicesProps {
  services: ModuleSchema[];
}

export function ListServices({ services }: ListServicesProps) {
  const [editingService, setEditingService] = useState<ModuleSchema | null>(null);
  const { data: modules = [], isLoading } = useModules();
  const createCompanyModule = useCreateCompanyModuleMutation();
  const [deleteTarget, setDeleteTarget] = useState<ModuleSchema | null>(null);
  const deleteModuleMutation = useDeleteModule();
  const [processing, setProcessing] = useState<{ id?: string; action?: 'delete' | 'toggle' | 'assign' } | null>(null);
 
  const { isGlobalAdmin } = useAuthStore();
  const [bulkCompanyId, setBulkCompanyId] = useState<string>("");
  const [bulkModuleId, setBulkModuleId] = useState<string>("");
  const [bulkIsActive, setBulkIsActive] = useState(true);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkModuleSearch, setBulkModuleSearch] = useState("");
  const [moduleSearch, setModuleSearch] = useState("");

  function handleEdit(service: ModuleSchema) {
    setEditingService(service);
  }

  function handleDeleteClick(service: ModuleSchema) {
    setDeleteTarget(service);
  }


  function confirmDelete() {
    if (!deleteTarget) return;
    setProcessing({ id: deleteTarget.id, action: "delete" });
    deleteModuleMutation.mutate(deleteTarget.id!, {
      onSettled: () => {
        setProcessing(null);
        setDeleteTarget(null);
      },
    });
  }

  const handleBulkAssociate = async () => {
    if (!bulkCompanyId || !bulkModuleId || isBulkSubmitting) return;
    setIsBulkSubmitting(true);
    try {
      await createCompanyModule.mutateAsync({
        companyId: bulkCompanyId,
        moduleId: bulkModuleId,
        status: bulkIsActive,
      });
      setBulkModuleId("");
      setBulkIsActive(true);
    } finally {
      setIsBulkSubmitting(false);
    }
  };
  
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
          const isActive =
            typeof rawStatus === "string"
              ? rawStatus.toLowerCase() === "true" || rawStatus === "1"
              : Boolean(rawStatus);
          return (
            <Badge
              className={`${isActive ? "bg-transparent text-green-600" : "bg-orange-200 text-red-600"} `}
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
  const filteredBulkModules = bulkModuleSearch
    ? modules.filter((module) =>
        module.name?.toLowerCase().includes(bulkModuleSearch.toLowerCase()),
      )
    : modules;


  const rowActions = [
  
    {
      label: "Editar",
      icon: <Edit className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
      onClick: handleEdit,
      variant: "ghost" as const,
    },
    {
      label: "Excluir",
      icon: <Trash className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
      onClick: handleDeleteClick,
      variant: "ghost" as const,
    },
   
  ];

  return (
    <div>
      <div>
        <DataTableGeneric
          data={services}
          columns={columns}
          searchKey="name"
          dateKey="createdAt"
          isLoading={isLoading}
          placeholder="Pesquisar serviços..."
          rowActions={rowActions as any}
          actionButton={
            isGlobalAdmin
              ? {
                  label: "Associação  dos serviços",
                  onClick: () => setBulkDialogOpen(true),
                }
              : undefined
          }
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
        isLoading={processing?.action === "delete"}
        title="Eliminar serviço"
        message={`Tem certeza que deseja eliminar o serviço ${deleteTarget?.name} ? Esta ação não pode ser desfeita.`}
      />
     
      {isGlobalAdmin && (
        <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-2xl">Associação de serviços</DialogTitle>
            </DialogHeader>
            <div className="space-y-4  grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Empresa
                </Label>
                <CompanySelect value={bulkCompanyId} onChange={setBulkCompanyId} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Serviço / Módulo
                </Label>
                <Select
                  value={bulkModuleId}
                  onValueChange={(value) => setBulkModuleId(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-3 pt-2 pb-1 border-b bg-background sticky top-0 z-10">
                      <Input
                        value={bulkModuleSearch}
                        onChange={(e) => setBulkModuleSearch(e.target.value)}
                        placeholder="Pesquisar serviço..."
                        className="h-8 text-sm placeholder:font-normal"
                        autoFocus
                      />
                    </div>
                    {filteredBulkModules.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">
                        {bulkModuleSearch
                          ? "Nenhum dado filtrado."
                          : "Nenhum serviço encontrado."}
                      </div>
                    ) : (
                      filteredBulkModules.map(
                        (module) =>
                          module.id && (
                            <SelectItem key={module.id} value={module.id}>
                              {module.name}
                            </SelectItem>
                          ),
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between border rounded-lg p-3">
                <Label htmlFor="bulk-status" className="mr-4">
                  Ativo
                </Label>
                <Switch
                  id="bulk-status"
                  className="cursor-pointer data-[state=checked]:bg-green-600"
                  checked={bulkIsActive}
                  onCheckedChange={setBulkIsActive}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkDialogOpen(false);
                  setBulkCompanyId("");
                  setBulkModuleId("");
                  setBulkModuleSearch("");
                  setBulkIsActive(true);
                }}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                disabled={!bulkCompanyId || !bulkModuleId || isBulkSubmitting}
                onClick={handleBulkAssociate}
              >
                {isBulkSubmitting ? "Associando..." : "Associar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
