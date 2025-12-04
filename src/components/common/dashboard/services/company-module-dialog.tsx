"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CompanySelect } from "@/components/common/base-ui/selects/company-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  useCompanyModuleByIdQuery,
  useCreateCompanyModuleMutation,
  useUpdateCompanyModuleMutation,
} from "@/infrastructure/hooks/useCompanies";
import { useModules } from "@/infrastructure/hooks/useModules";

export interface CompanyModuleDialogState {
  associationId?: string | null;
  defaultCompanyId?: string;
  defaultModuleId?: string;
  defaultStatus?: boolean;
}

interface CompanyModuleDialogProps extends CompanyModuleDialogState {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyModuleDialog({
  open,
  onOpenChange,
  associationId,
  defaultCompanyId,
  defaultModuleId,
  defaultStatus = true,
}: CompanyModuleDialogProps) {
  const createAssociation = useCreateCompanyModuleMutation();
  const updateAssociation = useUpdateCompanyModuleMutation();
  const { data: associationDetails, isFetching: isFetchingAssociation } =
    useCompanyModuleByIdQuery(open ? associationId ?? undefined : undefined);
  const { data: modules = [] } = useModules();

  const [companyId, setCompanyId] = useState<string>(defaultCompanyId ?? "");
  const [moduleId, setModuleId] = useState<string>(defaultModuleId ?? "");
  const [isActive, setIsActive] = useState<boolean>(defaultStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (associationDetails) {
      setCompanyId(
        associationDetails.companyId ??
          associationDetails.company?.id ??
          defaultCompanyId ??
          "",
      );
      setModuleId(
        associationDetails.moduleId ??
          associationDetails.module?.id ??
          defaultModuleId ??
          "",
      );
      const statusValue =
        (associationDetails as { status?: unknown }).status ??
        associationDetails.isActive;
      setIsActive(
        typeof statusValue === "string"
          ? statusValue.toLowerCase() === "true" || statusValue === "1"
          : Boolean(statusValue ?? defaultStatus),
      );
    } else {
      setCompanyId(defaultCompanyId ?? "");
      setModuleId(defaultModuleId ?? "");
      setIsActive(defaultStatus);
    }
    setSearchTerm("");
  }, [open, associationDetails, defaultCompanyId, defaultModuleId, defaultStatus]);

  const filteredModules = useMemo(
    () =>
      searchTerm
        ? modules.filter((module) =>
            module.name?.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : modules,
    [modules, searchTerm],
  );

  async function handleSubmit() {
    if (!companyId || !moduleId) return;
    setIsSubmitting(true);
    const payload = {
      companyId,
      moduleId,
      status: isActive,
    };
    const handleSettled = () => {
      setIsSubmitting(false);
      onOpenChange(false);
    };
    if (associationId) {
      updateAssociation.mutate(
        {
          id: associationId,
          ...payload,
        },
        {
          onSettled: handleSettled,
        },
      );
    } else {
      try {
        await createAssociation.mutateAsync(payload);
        handleSettled();
      } catch {
        setIsSubmitting(false);
      }
    }
  }

  const dialogTitle = associationId
    ? "Editar associação"
    : "Associar serviço à empresa";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onOpenChange(false);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader className="pb-2">
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-2 ">
            <Label className="text-xs font-medium text-muted-foreground">
              Empresa
            </Label>
            <CompanySelect value={companyId} onChange={setCompanyId} />
          </div>
          <div className="space-y-2 ">
            <Label className="text-xs font-medium text-muted-foreground">
              Serviço / Módulo
            </Label>
            <Select value={moduleId} onValueChange={setModuleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-3 pt-2 pb-1 border-b bg-background sticky top-0 z-10">
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Pesquisar serviço..."
                    className="h-8 text-sm placeholder:font-normal"
                    autoFocus
                  />
                </div>
                {filteredModules.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    {searchTerm ? "Nenhum dado filtrado." : "Nenhum serviço encontrado."}
                  </div>
                ) : (
                  filteredModules.map(
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
          <div className="flex items-center justify-between border rounded-lg p-3 col-span-2">
            <Label htmlFor="dialog-status" className="mr-4">
              Ativo
            </Label>
            <Switch
              id="dialog-status"
              className="cursor-pointer data-[state=checked]:bg-green-600"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
            disabled={isSubmitting || isFetchingAssociation}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            disabled={
              !companyId ||
              !moduleId ||
              isSubmitting ||
              isFetchingAssociation
            }
            onClick={handleSubmit}
          >
            {isSubmitting ? "Salvando..." : associationId ? "Salvar mudanças" : "Associar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


