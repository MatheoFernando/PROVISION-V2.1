import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SiteSelect } from "@/components/common/base-ui/selects/site-select";
import { TypeEquipmentSelect } from "@/components/common/base-ui/selects/type-equipment-select";
import { EmployeeSelect } from "@/components/common/base-ui/selects/employee-select";
import { createEquipmentSchema } from "@/infrastructure/schema/schema-equipment";
import { z } from "zod";
import {
  useCreateEquipment,
  useUpdateEquipment,
  type UpdateEquipmentInput,
} from "@/infrastructure/hooks/useEquipment";
import { toast } from "sonner";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import type { Equipment } from "@/infrastructure/types/domain";
import { Loader2 } from "lucide-react";

type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;

interface EquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentToEdit?: Equipment;
  customerId?: string;
  siteId?: string;
  isSiteLocked?: boolean;
  onSuccess?: (equipment?: Equipment) => void;
}

export function EquipmentDialog({
  open,
  onOpenChange,
  equipmentToEdit,
  customerId,
  siteId: propSiteId,
  isSiteLocked,
  onSuccess,
}: EquipmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyId = useAuthStore((s) => s.companyId) ?? "";

  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();

  const form = useForm<CreateEquipmentInput>({
    resolver: zodResolver(createEquipmentSchema),
    defaultValues: {
      cod: "",
      serialNumber: "",
      mark: "",
      model: "",
      status: true,
      siteId: propSiteId || "",
      typeEquipmentId: "",
      companyId: companyId,
      employeeId: "",
    },
  });

  useEffect(() => {
    if (companyId) form.setValue("companyId", companyId);
  }, [companyId, form]);

  useEffect(() => {
    if (equipmentToEdit) {
      form.reset({
        cod: equipmentToEdit.cod || "",
        serialNumber: equipmentToEdit.serialNumber || "",
        mark: equipmentToEdit.mark || "",
        model: equipmentToEdit.model || "",
        status:
          typeof equipmentToEdit.status === "boolean"
            ? equipmentToEdit.status
            : String(equipmentToEdit.status).toUpperCase() !== "INACTIVE",
        siteId: equipmentToEdit.siteId || (equipmentToEdit as any).site?.id || "",
        typeEquipmentId: equipmentToEdit.typeEquipmentId || (equipmentToEdit as any).typeEquipment?.id || "",
        companyId: equipmentToEdit.companyId || companyId,
        employeeId: (equipmentToEdit as any).employeeId || "",
      });
    } else if (open) {
      form.reset({
        cod: "",
        serialNumber: "",
        mark: "",
        model: "",
        status: true,
        siteId: propSiteId || "",
        typeEquipmentId: "",
        companyId: companyId,
        employeeId: "",
      });
    }
  }, [equipmentToEdit, form, companyId, open, propSiteId]);

  const onSubmit = async (data: CreateEquipmentInput) => {
    try {
      setIsSubmitting(true);
      const resolvedCompanyId =
        data.companyId?.trim() ||
        companyId ||
        equipmentToEdit?.companyId ||
        "";

      if (!resolvedCompanyId) {
        toast.error(
          "Empresa não encontrada. Atualize a página e tente novamente."
        );
        return;
      }

      const normalizedData: CreateEquipmentInput = {
        ...data,
        companyId: resolvedCompanyId,
      };

      let savedEquipment: Equipment | undefined;
      if (equipmentToEdit?.id) {
        const { companyId: _omitCompany, ...updateData } = normalizedData;
        const updatePayload: UpdateEquipmentInput = {
          id: equipmentToEdit.id,
          ...updateData,
          status: normalizedData.status ? "ACTIVE" : "INACTIVE",
        };
        // @ts-ignore
        savedEquipment = await updateEquipment.mutateAsync(updatePayload);
        toast.success("Equipamento atualizado com sucesso!");
      } else {
        // @ts-ignore
        savedEquipment = await createEquipment.mutateAsync(normalizedData);
        toast.success("Equipamento criado com sucesso!");
      }

      onOpenChange(false);
      if (onSuccess) onSuccess(savedEquipment);
    } catch (error) {
      toast.error("Erro ao salvar equipamento");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = isSubmitting || createEquipment.isPending || updateEquipment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden  dark:bg-slate-950">
        <DialogHeader className="pt-6 px-6 pb-2 border-b border-gray-100 bg-white dark:bg-slate-900/50">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {equipmentToEdit ? "Editar Equipamento" : "Novo Equipamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cod" className="text-slate-700 font-medium">
                  Código
                </Label>
                <Input
                  id="cod"
                  {...form.register("cod")}
                  placeholder="Digite o código"
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
                {form.formState.errors.cod && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.cod.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber" className="text-slate-700 font-medium">
                  Número de Série *
                </Label>
                <Input
                  id="serialNumber"
                  {...form.register("serialNumber")}
                  placeholder="Digite o número de série"
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
                {form.formState.errors.serialNumber && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.serialNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mark" className="text-slate-700 font-medium">
                  Marca *
                </Label>
                <Input
                  id="mark"
                  {...form.register("mark")}
                  placeholder="Digite a marca"
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
                {form.formState.errors.mark && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.mark.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-slate-700 font-medium">
                  Modelo *
                </Label>
                <Input
                  id="model"
                  {...form.register("model")}
                  placeholder="Digite o modelo"
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
                {form.formState.errors.model && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.model.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 ">
                <Label htmlFor="typeEquipmentId" className="text-slate-700 font-medium">
                  Tipo de Equipamento *
                </Label>
                <TypeEquipmentSelect
                  value={form.watch("typeEquipmentId")}
                  onChange={(v) => form.setValue("typeEquipmentId", v)}
                  companyId={companyId}
                />
                {form.formState.errors.typeEquipmentId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.typeEquipmentId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteId" className="text-slate-700 font-medium">
                  Site *
                </Label>
                <SiteSelect
                  customerId={customerId}
                  value={form.watch("siteId")}
                  onChange={(v) => form.setValue("siteId", v)}
                  disabled={isSiteLocked}
                />
                {form.formState.errors.siteId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.siteId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-slate-700 font-medium">
                  Responsável
                </Label>
                <EmployeeSelect
                  value={form.watch("employeeId")}
                  onChange={(v) => form.setValue("employeeId", v)}
                  companyId={companyId}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-slate-700 font-medium">
                  Estado
                </Label>
                <div className="flex items-center gap-3 py-2">
                  <Switch
                    id="status"
                    checked={!!form.watch("status")}
                    onCheckedChange={(checked) =>
                      form.setValue("status", checked)
                    }
                    className="cursor-pointer data-[state=checked]:bg-green-600"
                  />
                  <span className="text-sm text-slate-600 font-medium">
                    {form.watch("status") ? "Operacional" : "Não operacional"}
                  </span>
                </div>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className=" p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="shadow-lg rounded-xl px-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : equipmentToEdit ? (
                "Atualizar Equipamento"
              ) : (
                "Criar Equipamento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
