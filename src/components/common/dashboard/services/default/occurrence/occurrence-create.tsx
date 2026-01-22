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
import { useCreateOccurrenceMutation, useUpdateOccurrenceMutation } from "@/infrastructure/hooks/useOccurrences"
import { Label } from "@/components/ui/label"
import { Loader2, Clock2Icon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { TypeOccorrenceSelect } from "@/components/common/base-ui/selects/type-occorrence-select"
import { z } from "zod"
import type { Occorrence } from "@/infrastructure/types/domain"
import type { Occurrence } from "@/infrastructure/schema/schema-occurrence"
import { createOccurrenceSchema } from "@/infrastructure/schema/schema-occurrence"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type CreateOccurrenceFormValues = z.infer<typeof createOccurrenceSchema>

const TIME_FORMATTER: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}

const toInputTime = (value?: string): string => {
  if (!value) return ""
  if (value.includes("T")) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value.slice(11, 16)
    return date.toLocaleTimeString("pt-BR", TIME_FORMATTER).replace(".", ":")
  }
  return value.slice(0, 5)
}

const toIsoFromTime = (value: string): string => {
  if (!value) return ""
  if (value.includes("T") && !Number.isNaN(Date.parse(value))) return value
  const normalized = value.length === 5 ? `${value}:00` : value
  const today = new Date()
  const currentDate = today.toISOString().slice(0, 10)
  const composed = new Date(`${currentDate}T${normalized}`)
  if (Number.isNaN(composed.getTime())) return value
  return composed.toISOString()
}

interface OccurrenceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  occurrenceToEdit?: Occurrence
}

export function OccurrenceDialog({
  open,
  onOpenChange,
  occurrenceToEdit,
}: OccurrenceDialogProps) {
  const id = occurrenceToEdit?.id
  const companyId = useAuthStore((s) => s.companyId || "")
  const createMutation = useCreateOccurrenceMutation()
  const updateMutation = useUpdateOccurrenceMutation()

  const defaultValues = React.useMemo((): CreateOccurrenceFormValues => ({
    cod: "",
    description: "",
    companyId,
    typeOccorrenceId: "",
    equipmentId: "",
    employeeId: "",
    siteId: "",
    time: "",
    correctiveAction: "",
    gravity: "Baixa",
    status: "Ativo" as const,
  }), [companyId])

  const form = useForm<CreateOccurrenceFormValues>({
    resolver: zodResolver(createOccurrenceSchema) as Resolver<CreateOccurrenceFormValues>,
    defaultValues,
  })
  const timeValue = form.watch("time") ?? ""

  React.useEffect(() => {
    if (occurrenceToEdit && open) {
      form.reset({
        cod: occurrenceToEdit.cod || "",
        description: occurrenceToEdit.description || "",
        companyId: occurrenceToEdit.companyId || companyId,
        typeOccorrenceId: occurrenceToEdit.typeOccorrenceId || "",
        equipmentId: occurrenceToEdit.equipmentId || "",
        employeeId: occurrenceToEdit.employeeId || "",
        siteId: occurrenceToEdit.siteId || "",
        time: toInputTime(occurrenceToEdit.time),
        correctiveAction: occurrenceToEdit.correctiveAction || "",
        gravity: occurrenceToEdit.gravity as CreateOccurrenceFormValues["gravity"] || undefined,
        status: (occurrenceToEdit.status as CreateOccurrenceFormValues["status"]) || "Ativo",
      })
    } else if (open) {
      form.reset(defaultValues)
    }
  }, [occurrenceToEdit, form, companyId, open, defaultValues])

  function handleSubmit(data: CreateOccurrenceFormValues) {
    const basePayload = {
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
      }

      updateMutation.mutate(updatePayload, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    } else {
      const createPayload: Omit<Occorrence, 'id' | 'createdAt' | 'updatedAt'> = {
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
      }

      createMutation.mutate(createPayload, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden dark:bg-slate-950">
        <DialogHeader className="pt-6 px-6 pb-2 border-b border-gray-100 bg-white dark:bg-slate-900/50">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {occurrenceToEdit ? "Editar Ocorrência" : "Nova Ocorrência"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col">
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <Label className="text-slate-700 font-medium">Funcionário *</Label>
                <EmployeeSelect
                  value={form.watch("employeeId")}
                  onChange={(v) =>
                    form.setValue("employeeId", v, { shouldValidate: true })
                  }
                  companyId={companyId}
                />
                {form.formState.errors.employeeId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.employeeId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-slate-700 font-medium">
                  Horário *
                </Label>
                <div className="relative flex w-full items-center gap-2">
                  <Clock2Icon className="text-muted-foreground pointer-events-none absolute left-2.5 size-4 select-none" />
                  <Input
                    id="time"
                    type="time"
                    step="60"
                    className="appearance-none pl-8 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
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
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.time.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gravity" className="text-slate-700 font-medium">
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
                  <SelectTrigger className="w-full rounded-xl border-gray-200 bg-white">
                    <SelectValue placeholder="Selecione a gravidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 w-full md:w-auto">
                <Label htmlFor="cod" className="text-slate-700 font-medium">
                  Código *
                </Label>
                <Input
                  id="cod"
                  placeholder="Ex: OCC001"
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  {...form.register("cod")}
                />
                {form.formState.errors.cod && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.cod.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <Label className="text-slate-700 font-medium">Site *</Label>
                <SiteSelect
                  value={form.watch("siteId")}
                  onChange={(v) =>
                    form.setValue("siteId", v, { shouldValidate: true })
                  }
                />
                {form.formState.errors.siteId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.siteId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Tipo de Ocorrência *</Label>
                <TypeOccorrenceSelect
                  value={form.watch("typeOccorrenceId")}
                  onChange={(v) =>
                    form.setValue("typeOccorrenceId", v, { shouldValidate: true })
                  }
                />
                {form.formState.errors.typeOccorrenceId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.typeOccorrenceId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Equipamento</Label>
                <EquipmentSelect
                  value={form.watch("equipmentId")}
                  onChange={(v) =>
                    form.setValue("equipmentId", v, { shouldValidate: true })
                  }
                />
              </div>

              <div className="space-y-2 flex items-center md:col-span-2">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.watch("status") === "Ativo"}
                    onCheckedChange={(checked) =>
                      form.setValue("status", checked ? "Ativo" : "Inativo", {
                        shouldValidate: true,
                      })
                    }
                    className="cursor-pointer"
                  />
                  <Label className="text-slate-700 font-medium">
                    {form.watch("status") === "Ativo" ? "Estado: Ativo" : "Estado: Inativo"}
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 font-medium">
                Descrição
              </Label>
              <Textarea
                id="description"
                className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white resize-none"
                placeholder="Detalhe o ocorrido..."
                {...form.register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correctiveAction" className="text-slate-700 font-medium">
                Ação Corretiva
              </Label>
              <Textarea
                id="correctiveAction"
                className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white resize-none"
                placeholder="Ação tomada..."
                {...form.register("correctiveAction")}
              />
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="shadow-lg rounded-xl px-6 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A guardar...
                </>
              ) : occurrenceToEdit ? (
                "Atualizar Ocorrência"
              ) : (
                "Criar Ocorrência"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
