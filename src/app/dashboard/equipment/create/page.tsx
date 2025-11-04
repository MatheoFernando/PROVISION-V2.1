"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteSelect } from "@/components/common/base-ui/selects/site-select";
import { TypeEquipmentSelect } from "@/components/common/base-ui/selects/type-equipment-select";
import { createEquipmentSchema } from "@/infrastructure/schema/schema-equipment";
import { z } from "zod";
import { useCreateEquipment } from "@/infrastructure/hooks/useEquipment";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";

type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;

export default function Page() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyId = useAuthStore((s) => s.companyId) ?? "";

  const createEquipment = useCreateEquipment();

  const form = useForm<CreateEquipmentInput>({
    resolver: zodResolver(createEquipmentSchema),
    defaultValues: {
      serialNumber: "",
      mark: "",
      model: "",
      typeEquipmentId: "",
      companyId: companyId,
    },
  });

  useEffect(() => {
    if (companyId) form.setValue("companyId", companyId);
  }, [companyId, form]);

  const onSubmit = async (data: CreateEquipmentInput) => {
    try {
      setIsSubmitting(true);
      await (
        createEquipment.mutateAsync as (
          vars: CreateEquipmentInput
        ) => Promise<unknown>
      )(data);
      toast.success("Equipamento criado com sucesso!");
      router.push("/dashboard/equipment");
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar equipamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  

  return (
    <div className="min-h-screen ">
      <div >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Novo Equipamento
          </h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 space-y-6">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <input type="hidden" value={companyId} {...form.register("companyId")} />

                  <div className="space-y-2">
                    <Label htmlFor="siteId" className="text-slate-700">
                      Site  *
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

                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-8 py-4 flex justify-end gap-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="rounded-lg px-6 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6"
              >
                {isSubmitting ? "Salvando..." : "Criar Equipamento"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
