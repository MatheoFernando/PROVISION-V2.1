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
import { useCreateEquipment, useUpdateEquipment } from "@/infrastructure/hooks/useEquipment";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";

type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;

interface EquipmentCreatePageProps {
  id?: string;
  initialData?: Partial<CreateEquipmentInput> & { id?: string };
  onSuccess?: () => void;
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
      status: typeof d.status === 'boolean' ? d.status : (String(d.status).toUpperCase() !== 'INACTIVE'),
      siteId: (d as any).siteId || "",
      typeEquipmentId: (d as any).typeEquipmentId || "",
      companyId: d.companyId || companyId,
    });
  }, [props.initialData, form, companyId]);

  const isGuid = (v: unknown) => typeof v === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);

  const onSubmit = async (data: CreateEquipmentInput) => {
    try {
      setIsSubmitting(true);
      if (props.id && isGuid(props.id)) {
        const { companyId: _omit, ...rest } = (data as any) || {};
        const updatePayload: any = {
          ...rest,
          status: data.status ? "ACTIVE" : "INACTIVE",
        };
        await updateEquipment.mutateAsync({ id: props.id, data: updatePayload });
        toast.success("Equipamento atualizado com sucesso!");
      } else {
        const { companyId: _omit, ...createOnly } = (data as any) || {};
        await (createEquipment.mutateAsync as (vars: any) => Promise<unknown>)(createOnly);
        toast.success("Equipamento criado com sucesso!");
      }
      if (props.onSuccess) props.onSuccess(); else form.reset();
    } catch (error) {
      toast.error("Erro ao salvar equipamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Novo Equipamento
        </h1>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Ativo
                </Label>
                <div className="flex items-center gap-3 py-2">
                  <Switch
                    id="status"
                    checked={!!form.watch("status")}
                    onCheckedChange={(checked) =>
                      form.setValue("status", checked)
                    }
                  />
                  <span className="text-sm text-slate-600">
                    {form.watch("status") ? "Ativo" : "Inativo"}
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
                onClick={() => (props.onCancel ? props.onCancel() : router.back())}
                className="rounded-lg px-6 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || createEquipment.isPending || updateEquipment.isPending}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6"
              >
                {isSubmitting || createEquipment.isPending || updateEquipment.isPending
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
