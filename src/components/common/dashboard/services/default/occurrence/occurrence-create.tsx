"use client"

import * as React from "react"
import { type Resolver, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { EmployeeSelect } from "@/components/common/base-ui/selects/employee-select"
import { SiteSelect } from "@/components/common/base-ui/selects/site-select"
import { EquipmentSelect } from "@/components/common/base-ui/selects/equipment-select"
import { useCreateOccurrenceMutation, useOccurrence, useUpdateOccurrenceMutation } from "@/infrastructure/hooks/useOccurrences"
import { Label } from "@/components/ui/label"
import { Loader2, Clock2Icon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { TypeOccorrenceSelect } from "@/components/common/base-ui/selects/type-occorrence-select"
import { z } from "zod"
import type { Occorrence } from "@/infrastructure/types/domain"
import { createOccurrenceSchema } from "@/infrastructure/schema/schema-occurrence"
import { useSearchParams } from "next/navigation"

type CreateOccurrenceFormValues = z.infer<typeof createOccurrenceSchema>

const timeFormatter: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}

const toInputTime = (value?: string) => {
  if (!value) return ""
  if (value.includes("T")) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value.slice(11, 16)
    return date.toLocaleTimeString("pt-BR", timeFormatter).replace(".", ":")
  }
  return value.slice(0, 5)
}

const toIsoFromTime = (value: string) => {
  if (!value) return ""
  if (value.includes("T") && !Number.isNaN(Date.parse(value))) return value
  const normalized = value.length === 5 ? `${value}:00` : value
  const today = new Date()
  const currentDate = today.toISOString().slice(0, 10)
  const composed = new Date(`${currentDate}T${normalized}`)
  if (Number.isNaN(composed.getTime())) return value
  return composed.toISOString()
}

interface OccurrenceCreateProps {
  id?: string
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function OccurrenceCreate(props: OccurrenceCreateProps) {
  const params = useSearchParams()
  const routeId = params.get("id") || undefined
  const id = props.id ?? routeId
  const companyId = useAuthStore((s) => s.companyId || "")
  const createMutation = useCreateOccurrenceMutation()
  const updateMutation = useUpdateOccurrenceMutation()

  const form = useForm<CreateOccurrenceFormValues>({
    resolver: zodResolver(createOccurrenceSchema) as Resolver<CreateOccurrenceFormValues>,
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
      gravity: undefined,
      status: "Ativo",
    },
  })
  const timeValue = form.watch("time") ?? ""
  const shouldQuery = !props.initialData && !!id
  const { data: occurrenceData } = useOccurrence(shouldQuery ? id || "" : "")

  React.useEffect(() => {
    const dataToUse = props.initialData || occurrenceData
    if (!id || !dataToUse) return
    form.reset({
      cod: dataToUse.cod || "",
      description: dataToUse.description || "",
      companyId: dataToUse.companyId || companyId,
      typeOccorrenceId: dataToUse.typeOccorrenceId || dataToUse.typeOccurrenceId || "",
      equipmentId: dataToUse.equipmentId || "",
      employeeId: dataToUse.employeeId || "",
      siteId: dataToUse.siteId || "",
      time: toInputTime(dataToUse.time),
      correctiveAction: dataToUse.correctiveAction || "",
      gravity: dataToUse.gravity || undefined,
      status: dataToUse.status || "Ativo",
    })
  }, [props.initialData, occurrenceData, form, companyId, id])

  function handleSubmit(data: CreateOccurrenceFormValues) {
    const basePayload: CreateOccurrenceFormValues = {
      ...data,
      time: toIsoFromTime(data.time),
      companyId: data.companyId || companyId,
    }

    if (id) {
      const updatePayload: Occorrence = {
        id,
        cod: basePayload.cod,
        companyId: basePayload.companyId,
        description: basePayload.description ?? "",
        typeOccorrenceId: basePayload.typeOccorrenceId ?? "",
        equipmentId: basePayload.equipmentId ?? "",
        employeeId: basePayload.employeeId,
        siteId: basePayload.siteId,
        time: basePayload.time,
        correctiveAction: basePayload.correctiveAction ?? "",
        gravity: basePayload.gravity ?? "Baixa",
        status: basePayload.status ?? "Ativo",
      };

      updateMutation.mutate(updatePayload, {
        onSuccess: () => {
          if (props.onSuccess) props.onSuccess()
        },
      });
    } else {
      createMutation.mutate(basePayload as Occorrence, {
        onSuccess: () => {
          if (props.onSuccess) props.onSuccess()
        },
      });
    }
  }

  return (
    <div>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 "
      >
        <div className="py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 md:col-span-3">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-3">
              <div className="space-y-2">
                <Label htmlFor="time" className="text-slate-700">
                  Horário
                </Label>
                <div className="relative flex w-full items-center gap-2">
                  <Clock2Icon className="text-muted-foreground pointer-events-none absolute left-2.5 size-4 select-none" />
                  <Input
                    id="time"
                    type="time"
                    step="60"
                    className="appearance-none pl-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    value={timeValue}
                    defaultValue="08:00"
                    onClick={(event) => {
                      const target = event.currentTarget as HTMLInputElement & { showPicker?: () => void }
                      if (typeof target.showPicker === "function") target.showPicker()
                    }}
                    {...form.register("time")}
                  />
                </div>
                {form.formState.errors.time && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.time.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 ">
                <Label htmlFor="gravity" className="text-slate-700">
                  Gravidade
                </Label>
                <Select
                  value={form.watch("gravity") || ""}
                  onValueChange={(v) =>
                    form.setValue("gravity", v as CreateOccurrenceFormValues["gravity"], {
                      shouldValidate: true,
                    })
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

              <div className="space-y-2 w-16">
                <Label className="text-slate-700">Estado</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.watch("status") === "Ativo"}
                    onCheckedChange={(checked) =>
                      form.setValue("status", checked ? "Ativo" : "Inativo", {
                        shouldValidate: true,
                      })
                    }
                    className="cursor-pointer data-[state=checked]:bg-green-600"
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

          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col md:flex-row gap-4 md:col-span-2">
              <div className="space-y-2 w-full md:w-auto">
                <Label htmlFor="cod" className="text-slate-700">
                  Código
                </Label>
                <Input
                  id="cod"
                  placeholder="Ex: OCC001"
                  className="rounded-lg w-32"
                  {...form.register("cod")}
                />
                {form.formState.errors.cod && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.cod.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 flex-1">
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
