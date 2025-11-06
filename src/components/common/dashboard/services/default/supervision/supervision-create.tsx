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
import { useCreateSupervisionMutation, useSupervisionQuery, useUpdateSupervisionMutation } from "@/infrastructure/hooks/useSupervisions";
import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Loader2, Clock2Icon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Supervision } from "@/infrastructure/types/domain";
import { supervisionSchema } from "@/infrastructure/schema/schema-supervision";
import z from "zod";

interface SupervisionFormProps {
  id?: string
  initialData?: Supervision
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SupervisionCreate(_props: SupervisionFormProps) {
  const params = useSearchParams();
  const routeId = params.get("id") || undefined;
  const id = _props.id ?? routeId;
  const createMutation = useCreateSupervisionMutation();
  const updateMutation = useUpdateSupervisionMutation();
  const companyId = useAuthStore((s) => s.companyId || "");
  const form = useForm<z.infer<typeof supervisionSchema>>({
    resolver: zodResolver(supervisionSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
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

  const shouldQuery = !(_props.initialData) && !!id
  const { data: supervisionData } = useSupervisionQuery(shouldQuery ? (id || "") : "");

  React.useEffect(() => {
    const dataToUse = _props.initialData || supervisionData
    if (!id || !dataToUse) return;
    const parseTime = (value: string) => {
      if (!value) return "";
      return value.includes("T") ? value.slice(11, 16) : value.slice(0, 5);
    };
    form.reset({
      cod: dataToUse.cod || "",
      observation: dataToUse.observation || "",
      companyId: dataToUse.companyId || companyId,
      desiredNumberWorkers: Number(dataToUse.desiredNumberWorkers ?? 0),
      numberWorkerPresent: Number(dataToUse.numberWorkerPresent ?? 0),
      equipmentId: dataToUse.equipmentId || "",
      employeeId: dataToUse.employeeId || "",
      siteId: dataToUse.siteId || "",
      time: parseTime(dataToUse.time || ""),
      departmentId: dataToUse.departmentId || "",
      status: dataToUse.status || "Ativo",
    });
  }, [id, supervisionData, _props.initialData, form, companyId]);

  const handleSubmit = (data: z.infer<typeof supervisionSchema>) => {
    const toIsoFromTime = (value: string) => {
      if (!value) return "";
      if (value.includes("T")) return value;
      return new Date(`1970-01-01T${value}`).toISOString();
    };

    const payload = {
      ...data,
      time: toIsoFromTime(data.time),
      desiredNumberWorkers: Number(data.desiredNumberWorkers ?? 0),
      numberWorkerPresent: Number(data.numberWorkerPresent ?? 0),
    } as Supervision;

    if (id) {
      updateMutation.mutate(
        { id, data: payload },
        {
          onSuccess: () => {
            if (typeof _props.onSuccess === "function") _props.onSuccess();
          },
        }
      );
      return;
    }

    createMutation.mutate(payload as Supervision, {
      onSuccess: () => {
        if (typeof _props.onSuccess === "function") _props.onSuccess();
      },
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">
        {id ? "Editar Supervisão" : "Nova Supervisão"}
      </h1>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 mt-6"
      >
        <div className="overflow-hidden p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
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
              <div className="relative flex w-full items-center gap-2">
                <Clock2Icon className="text-muted-foreground pointer-events-none absolute left-2.5 size-4 select-none" />
                <Input
                  id="time"
                  type="time"
                  defaultValue=""
                  className="appearance-none pl-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  {...form.register("time")}
                />
              </div>
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
                onChange={(v) => form.setValue("employeeId", v)}
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
                onChange={(v) => form.setValue("equipmentId", v)}
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
                onChange={(v) => form.setValue("siteId", v)}
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
                onChange={(v) => form.setValue("departmentId", v)}
              />
              {form.formState.errors.departmentId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.departmentId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="desiredNumberWorkers" className="text-slate-700">
                Trabalhadores Desejados
              </Label>
              <Input
                id="desiredNumberWorkers"
                type="number"
                min="0"
                value={form.watch("desiredNumberWorkers")}
                onChange={(e) =>
                  form.setValue(
                    "desiredNumberWorkers",
                    parseInt(e.target.value) || 0
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
                    parseInt(e.target.value) || 0
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

          <div className="space-x-2   flex justify-end gap-3 ">
          <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (typeof _props.onCancel === "function") _props.onCancel();
              }}
              className="rounded-lg px-6 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6"
            >
            {createMutation.isPending || updateMutation.isPending ? (
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
