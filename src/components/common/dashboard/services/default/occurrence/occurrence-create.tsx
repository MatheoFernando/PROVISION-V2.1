"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { EmployeeSelect } from "@/components/common/base-ui/selects/employee-select";
import { SiteSelect } from "@/components/common/base-ui/selects/site-select";
import { EquipmentSelect } from "@/components/common/base-ui/selects/equipment-select";
import { useCreateOccurrenceMutation, useUpdateOccurrenceMutation } from "@/infrastructure/hooks/useOccurrences";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { TypeOccorrenceSelect } from "@/components/common/base-ui/selects/type-occorrence-select";
import { z } from "zod";

const createOccurrenceSchema = z.object({
  cod: z.string().min(1, "Código obrigatório"),
  description: z.string().default(""),
  companyId: z.string().min(1),
  typeOccorrenceId: z.string().min(1, "Tipo obrigatório"),
  equipmentId: z.string().min(1, "Equipamento obrigatório"),
  employeeId: z.string().min(1, "Funcionário obrigatório"),
  siteId: z.string().min(1, "Site obrigatório"),
  time: z.string().min(1, "Horário obrigatório"),
  correctiveAction: z.string().default(""),
  gravity: z.string().default(""),
  status: z.string().min(1),
});

type CreateOccurrenceInput = z.output<typeof createOccurrenceSchema>;

interface OccurrenceCreateProps {
  id?: string
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function OccurrenceCreate(props: OccurrenceCreateProps) {
  const companyId = useAuthStore((s) => s.companyId || "");
  const createMutation = useCreateOccurrenceMutation();
  const updateMutation = useUpdateOccurrenceMutation();

  const form = useForm({
    resolver: zodResolver(createOccurrenceSchema),
    defaultValues: {
      cod: "",
      description: "",
      companyId,
      typeOccorrenceId: "",
      equipmentId: "",
      employeeId: "",
      siteId: "",
      time: "",
      correctiveAction: "",
      gravity: "",
      status: "Ativo",
    },
  });

  React.useEffect(() => {
    const d = props.initialData
    if (!d) return
    const parseTime = (value: string) => {
      if (!value) return ""
      return value.includes("T") ? value.slice(11, 16) : value.slice(0, 5)
    }
    form.reset({
      cod: d.cod || "",
      description: d.description || "",
      companyId: d.companyId || companyId,
      typeOccorrenceId: d.typeOccorrenceId || d.typeOccurrenceId || "",
      equipmentId: d.equipmentId || "",
      employeeId: d.employeeId || "",
      siteId: d.siteId || "",
      time: parseTime(d.time || ""),
      correctiveAction: d.correctiveAction || "",
      gravity: d.gravity || "",
      status: d.status || "Ativo",
    })
  }, [props.initialData, form, companyId])

  function handleSubmit(data: CreateOccurrenceInput) {
    const toIsoFromTime = (value: string) => {
      if (!value) return "";
      if (value.includes("T")) return value;
      return new Date(`1970-01-01T${value}`).toISOString();
    };

    const basePayload = {
      ...data,
      time: toIsoFromTime(data.time),
    } as any;

    if (props.id) {
      const { companyId: _omit, ...updateOnly } = basePayload;
      updateMutation.mutate(
        { id: props.id, data: updateOnly },
        { onSuccess: () => { if (props.onSuccess) props.onSuccess() } }
      )
    } else {
      const createPayload = { ...basePayload, companyId: data.companyId || companyId } as any;
      createMutation.mutate(createPayload, {
        onSuccess: () => { if (props.onSuccess) props.onSuccess() },
      });
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Nova Ocorrência</h1>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 "
      >
        <div className=" py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
            <div className="space-y-2">
              <Label htmlFor="cod" className="text-slate-700">
                Código
              </Label>
              <Input
                id="cod"
                placeholder="Ex: OCC001"
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
              <Label className="text-slate-700">Tipo de Ocorrência</Label>
              <TypeOccorrenceSelect
                value={form.watch("typeOccorrenceId")}
                onChange={(v) =>
                  form.setValue("typeOccorrenceId", v, { shouldValidate: true })
                }
              />
              {form.formState.errors.typeOccorrenceId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.typeOccorrenceId.message}
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
              <Label htmlFor="gravity" className="text-slate-700">
                Gravidade
              </Label>
              <Select
                value={form.watch("gravity") || ""}
                onValueChange={(v) =>
                  form.setValue("gravity", v, { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a gravidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
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
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700">
                Descrição
              </Label>
              <Textarea
                id="description"
                className="rounded-lg resize-none"
                placeholder="Digite a descrição"
                {...form.register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correctiveAction" className="text-slate-700">
                Ação Corretiva
              </Label>
              <Textarea
                id="correctiveAction"
                className="rounded-lg resize-none"
                placeholder="Digite a ação corretiva"
                {...form.register("correctiveAction")}
              />
            </div>
          </div>
        
          <div className="space-x-2 pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => props.onCancel?.()}
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
              ) : props.id ? "Atualizar Ocorrência" : "Criar Ocorrência"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
