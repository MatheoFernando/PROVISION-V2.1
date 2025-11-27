"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SiteSelect } from "@/components/common/base-ui/selects/site-select";
import { TypeEquipmentSelect } from "@/components/common/base-ui/selects/type-equipment-select";
import { createEquipmentSchema } from "@/infrastructure/schema/schema-equipment";
import { z } from "zod";
import {
  useCreateEquipment,
  useUpdateEquipment,
  type UpdateEquipmentInput,
} from "@/infrastructure/hooks/useEquipment";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import type { Equipment } from "@/infrastructure/types/domain";

type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;

interface EquipmentCreatePageProps {
  id?: string;
  initialData?: Partial<CreateEquipmentInput> & { id?: string };
  customerId?: string;
  onSuccess?: (equipment?: Equipment) => void;
  onCancel?: () => void;
}

export default function EquipmentCreatePage(props: EquipmentCreatePageProps) {
  const router = useRouter();
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
      siteId: "",
      typeEquipmentId: "",
      companyId: companyId,
    },
  });

  useEffect(() => {
    if (companyId) form.setValue("companyId", companyId);
  }, [companyId, form]);

  useEffect(() => {
    const d = props.initialData;
    if (!d) return;
    form.reset({
      cod: d.cod || "",
      serialNumber: d.serialNumber || "",
      mark: d.mark || "",
      model: d.model || "",
      status:
        typeof d.status === "boolean"
          ? d.status
          : String(d.status).toUpperCase() !== "INACTIVE",
      siteId: (d as any).siteId || "",
      typeEquipmentId: (d as any).typeEquipmentId || "",
      companyId: d.companyId || companyId,
    });
  }, [props.initialData, form, companyId]);

  const onSubmit = async (data: CreateEquipmentInput) => {
    try {
      setIsSubmitting(true);
      const resolvedCompanyId =
        data.companyId?.trim() ||
        companyId ||
        props.initialData?.companyId ||
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
      if (props.id) {
        const { companyId: _omitCompany, ...updateData } = normalizedData;
        const updatePayload: UpdateEquipmentInput = {
          id: props.id,
          ...updateData,
          status: normalizedData.status ? "ACTIVE" : "INACTIVE",
        };
        savedEquipment = await updateEquipment.mutateAsync(updatePayload);
        toast.success("Equipamento atualizado com sucesso!");
      } else {
        savedEquipment = await createEquipment.mutateAsync(normalizedData);
        toast.success("Equipamento criado com sucesso!");
      }
      if (props.onSuccess) props.onSuccess(savedEquipment);
      else form.reset();
    } catch (error) {
      toast.error("Erro ao salvar equipamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cod" className="text-slate-700">
                Código
              </Label>
              <Input
                id="cod"
                {...form.register("cod")}
                placeholder="Digite o código"
                className="rounded-lg"
              />
              {form.formState.errors.cod && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.cod.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber" className="text-slate-700">
                Número de Série *
              </Label>
              <Input
                id="serialNumber"
                {...form.register("serialNumber")}
                placeholder="Digite o número de série"
                className="rounded-lg"
              />
              {form.formState.errors.serialNumber && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.serialNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mark" className="text-slate-700">
                Marca *
              </Label>
              <Input
                id="mark"
                {...form.register("mark")}
                placeholder="Digite a marca"
                className="rounded-lg"
              />
              {form.formState.errors.mark && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.mark.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="text-slate-700">
                Modelo *
              </Label>
              <Input
                id="model"
                {...form.register("model")}
                placeholder="Digite o modelo"
                className="rounded-lg"
              />
              {form.formState.errors.model && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.model.message}
                </p>
              )}
            </div>

            <div className="space-y-2 ">
              <Label htmlFor="typeEquipmentId" className="text-slate-700">
                Tipo de Equipamento *
              </Label>
              <TypeEquipmentSelect
                value={form.watch("typeEquipmentId")}
                onChange={(v) => form.setValue("typeEquipmentId", v)}
                companyId={companyId}
              />
              {form.formState.errors.typeEquipmentId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.typeEquipmentId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteId" className="text-slate-700">
                Site *
              </Label>
              <SiteSelect
                customerId={props.customerId}
                value={form.watch("siteId")}
                onChange={(v) => form.setValue("siteId", v)}
              />
              {form.formState.errors.siteId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.siteId.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-700">
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
                <span className="text-sm text-slate-600">
                  {form.watch("status") ? "Operacional" : "Não operacional"}
                </span>
              </div>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                props.onCancel ? props.onCancel() : router.back()
              }
              className="rounded-lg px-6 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                createEquipment.isPending ||
                updateEquipment.isPending
              }
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6"
            >
              {isSubmitting ||
              createEquipment.isPending ||
              updateEquipment.isPending
                ? "Salvando..."
                : props.id
                ? "Atualizar Equipamento"
                : "Criar Equipamento"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
