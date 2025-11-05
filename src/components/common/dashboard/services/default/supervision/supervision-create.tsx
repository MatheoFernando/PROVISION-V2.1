"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { EmployeeSelect } from "@/components/common/base-ui/selects/employee-select";
import { DepartmentSelect } from "@/components/common/base-ui/selects/department-select";
import { SiteSelect } from "@/components/common/base-ui/selects/site-select";
import { EquipmentSelect } from "@/components/common/base-ui/selects/equipment-select";
import { useCreateSupervisionMutation } from "@/infrastructure/hooks/useSupervisions";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Supervision } from "@/infrastructure/types/domain";
import { supervisionSchema } from "@/infrastructure/schema/schema-supervision";
import z from "zod";

interface SupervisionFormProps {}

export function SupervisionCreate(_props: SupervisionFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") || undefined;
  const createMutation = useCreateSupervisionMutation();
  const companyId = useAuthStore((s) => s.companyId || "");
  const form = useForm<z.infer<typeof supervisionSchema>>({
    resolver: zodResolver(supervisionSchema),
    defaultValues: {
      cod: "",
      observation: "",
      companyId: companyId,
      desiredNumberWorkers: 0,
      numberWorkerPresent: 0,
      equipmentId: "",
      employeeId: "",
      siteId: "",
      time: "",
      departmentId: "",
      status: "Ativo",
    },
  });

  const handleSubmit = (data: z.infer<typeof supervisionSchema>) => {
    const toIsoFromTime = (value: string) => {
      if (!value) return "";
      if (value.includes("T")) return value; 
      const [hoursStr, minutesStr] = value.split(":");
      const hours = parseInt(hoursStr || "0", 10);
      const minutes = parseInt(minutesStr || "0", 10);
      const d = new Date();
      d.setSeconds(0, 0);
      d.setHours(hours, minutes, 0, 0);
      return d.toISOString();
    };

    const payload = {
      ...data,
      id, 
      time: toIsoFromTime(data.time),
      desiredNumberWorkers: Number(data.desiredNumberWorkers ?? 0),
      numberWorkerPresent: Number(data.numberWorkerPresent ?? 0),
    };
    createMutation.mutate(payload as Supervision, {
      onSuccess: () => {
        toast.success("Supervisão criada com sucesso!");
        router.push("/dashboard/service/supervision");
      },
    });
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">
        {id ? "Editar Supervisão" : "Nova Supervisão"}
      </h1>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 mt-6"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cod" className="text-slate-700">
                Código
              </Label>
              <Input
                id="cod"
                placeholder="Ex: SUP001"
                {...form.register("cod")}
              />
              {form.formState.errors.cod && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.cod.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-slate-700">
                Horário
              </Label>
              <Input id="time" type="time" {...form.register("time")} />
              {form.formState.errors.time && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.time.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Funcionário</Label>
              <EmployeeSelect
                value={form.watch("employeeId")}
                onChange={(v) =>
                  form.setValue("employeeId", v, { shouldValidate: true })
                }
                companyId={companyId}
              />
              {form.formState.errors.employeeId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.employeeId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Equipamento</Label>
              <EquipmentSelect
                value={form.watch("equipmentId")}
                onChange={(v) =>
                  form.setValue("equipmentId", v, { shouldValidate: true })
                }
              />
              {form.formState.errors.equipmentId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.equipmentId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Site</Label>
              <SiteSelect
                value={form.watch("siteId")}
                onChange={(v) =>
                  form.setValue("siteId", v, { shouldValidate: true })
                }
              />
              {form.formState.errors.siteId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.siteId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Departamento</Label>
              <DepartmentSelect
                companyId={companyId}
                value={form.watch("departmentId")}
                onChange={(v) =>
                  form.setValue("departmentId", v, { shouldValidate: true })
                }
              />
              {form.formState.errors.departmentId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.departmentId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="desiredNumberWorkers" className="text-slate-700">
                Número Desejado de Trabalhadores
              </Label>
              <Input
                id="desiredNumberWorkers"
                type="number"
                min="0"
                value={form.watch("desiredNumberWorkers")}
                onChange={(e) =>
                  form.setValue(
                    "desiredNumberWorkers",
                    parseInt(e.target.value) || 0,
                    { shouldValidate: true }
                  )
                }
              />
              {form.formState.errors.desiredNumberWorkers && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.desiredNumberWorkers.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberWorkerPresent" className="text-slate-700">
                Número Presente
              </Label>
              <Input
                id="numberWorkerPresent"
                type="number"
                min="0"
                value={form.watch("numberWorkerPresent")}
                onChange={(e) =>
                  form.setValue(
                    "numberWorkerPresent",
                    parseInt(e.target.value) || 0,
                    { shouldValidate: true }
                  )
                }
              />
              {form.formState.errors.numberWorkerPresent && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.numberWorkerPresent.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation" className="text-slate-700">
              Observação
            </Label>
            <Textarea
              id="observation"
              placeholder="Digite uma observação..."
              className=" rounded-lg resize-none"
              {...form.register("observation")}
            />
            {form.formState.errors.observation && (
              <p className="text-sm text-red-500">
                {form.formState.errors.observation.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700">Status</Label>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.watch("status") === "Ativo"}
                onCheckedChange={(checked) =>
                  form.setValue("status", checked ? "Ativo" : "Inativo", {
                    shouldValidate: true,
                  })
                }
              />
              <span className="text-sm text-muted-foreground">
                {form.watch("status") === "Ativo" ? "Ativo" : "Inativo"}
              </span>
            </div>
            {form.formState.errors.status && (
              <p className="text-sm text-red-500">
                {form.formState.errors.status.message}
              </p>
            )}
          </div>

          <div className="space-x-2 pt-4 bg-slate-50 px-8 py-4 flex justify-end gap-3 border-t border-slate-200">
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
              disabled={createMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                </>
              ) : id ? (
                "Atualizar Supervisão"
              ) : (
                "Criar Supervisão"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
