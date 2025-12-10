"use client"

import * as React from "react"
import { type Resolver, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { EmployeeSelect } from "@/components/common/base-ui/selects/employee-select"
import { DepartmentSelect } from "@/components/common/base-ui/selects/department-select"
import { SiteSelect } from "@/components/common/base-ui/selects/site-select"
import { EquipmentSelect } from "@/components/common/base-ui/selects/equipment-select"
import {
  useCreateSupervisionMutation,
  useSupervisionQuery,
  useUpdateSupervisionMutation,
} from "@/infrastructure/hooks/useSupervisions"
import { Label } from "@/components/ui/label"
import { Loader2, Clock2Icon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Supervision } from "@/infrastructure/types/domain"
import { supervisionSchema } from "@/infrastructure/schema/schema-supervision"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type SupervisionFormValues = z.infer<typeof supervisionSchema>

const timeFormatter: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}

function parseOptionalNumber(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

function stringifyOptionalNumber(value?: number | null) {
  if (value === null || value === undefined) return undefined
  return Number.isNaN(value) ? undefined : String(value)
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

interface SupervisionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supervisionToEdit?: Supervision
}

export function SupervisionDialog({
  open,
  onOpenChange,
  supervisionToEdit,
}: SupervisionDialogProps) {
  const paramsId = undefined; 
  const id = supervisionToEdit?.id
  const createMutation = useCreateSupervisionMutation()
  const updateMutation = useUpdateSupervisionMutation()
  const companyId = useAuthStore((s) => s.companyId || "")
  const defaultValues = React.useMemo<SupervisionFormValues>(
    () => ({
      cod: "",
      observation: "",
      companyId,
      desiredNumberWorkers: undefined,
      numberWorkerPresent: undefined,
      equipmentId: "",
      employeeId: "",
      siteId: "",
      time: "",
      departmentId: "",
      status: "Em andamento",
    }),
    [companyId]
  )
  const form = useForm<SupervisionFormValues>({
    resolver: zodResolver(supervisionSchema) as Resolver<SupervisionFormValues>,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues,
  })
  const timeValue = form.watch("time") ?? "";

  React.useEffect(() => {
    if (supervisionToEdit && open) {
      form.reset({
        cod: supervisionToEdit.cod || "",
        observation: supervisionToEdit.observation || "",
        companyId: supervisionToEdit.companyId || companyId,
        desiredNumberWorkers: parseOptionalNumber(supervisionToEdit.desiredNumberWorkers),
        numberWorkerPresent: parseOptionalNumber(supervisionToEdit.numberWorkerPresent),
        equipmentId: supervisionToEdit.equipmentId || "",
        employeeId: supervisionToEdit.employeeId || "",
        siteId: supervisionToEdit.siteId || "",
        time: toInputTime(supervisionToEdit.time),
        departmentId: supervisionToEdit.departmentId || "",
        status: supervisionToEdit.status || "Ativo",
      })
    } else if (open) {
      form.reset(defaultValues)
    }
  }, [supervisionToEdit, form, companyId, open, defaultValues])

  const handleSubmit = (data: SupervisionFormValues) => {
    const basePayload = {
      ...data,
      time: toIsoFromTime(data.time),
    }

    const desiredNumberWorkers = stringifyOptionalNumber(
      basePayload.desiredNumberWorkers
    );
    const numberWorkerPresent = stringifyOptionalNumber(
      basePayload.numberWorkerPresent
    );

    if (id) {
      const updatePayload = {
        id,
        cod: basePayload.cod,
        companyId: basePayload.companyId || companyId,
        observation: basePayload.observation,
        desiredNumberWorkers,
        equipmentId: basePayload.equipmentId || undefined,
        employeeId: basePayload.employeeId || undefined,
        siteId: basePayload.siteId,
        time: basePayload.time,
        numberWorkerPresent,
        departmentId: basePayload.departmentId || undefined,
        status: basePayload.status,
      } as Supervision;

      updateMutation.mutate(updatePayload, {
        onSuccess: () => {
          onOpenChange(false)
        },
      });
      return;
    }
    const createPayload = {
      cod: basePayload.cod,
      observation: basePayload.observation,
      companyId: basePayload.companyId || companyId,
      desiredNumberWorkers,
      equipmentId: basePayload.equipmentId || undefined,
      employeeId: basePayload.employeeId || undefined,
      siteId: basePayload.siteId,
      time: basePayload.time,
      numberWorkerPresent,
      departmentId: basePayload.departmentId || undefined,
      status: basePayload.status,
    } as Supervision;
    createMutation.mutate(createPayload, {
      onSuccess: () => {
        onOpenChange(false)
      },
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden  dark:bg-slate-950">
        <DialogHeader className="pt-6 px-6 pb-2 border-b border-gray-100 bg-white dark:bg-slate-900/50">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {supervisionToEdit ? "Editar Supervisão" : "Nova Supervisão"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col">
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <Label className="text-slate-700 font-medium">Funcionário *</Label>
                <EmployeeSelect
                  value={form.watch("employeeId")}
                  onChange={(v) => form.setValue("employeeId", v)}
                  companyId={companyId}
                />
                {form.formState.errors.employeeId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.employeeId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Site *</Label>
                <SiteSelect
                  value={form.watch("siteId")}
                  onChange={(v) => form.setValue("siteId", v)}
                />
                {form.formState.errors.siteId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.siteId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Departamento</Label>
                <DepartmentSelect
                  companyId={companyId}
                  value={form.watch("departmentId")}
                  onChange={(v) => form.setValue("departmentId", v)}
                />
                {form.formState.errors.departmentId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.departmentId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 w-full md:w-auto">
                <Label htmlFor="cod" className="text-slate-700 font-medium">
                  Código
                </Label>
                <Input
                  id="cod"
                  placeholder="Ex: SUP001"
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
                <Label className="text-slate-700 font-medium">Equipamento</Label>
                <EquipmentSelect
                  value={form.watch("equipmentId")}
                  onChange={(v) => form.setValue("equipmentId", v)}
                />
                {form.formState.errors.equipmentId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.equipmentId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Estado</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) =>
                  form.setValue("status", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full rounded-xl border-gray-200 bg-white">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500 font-medium">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time" className="text-slate-700 font-medium">
                  Horário
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
                <Label htmlFor="desiredNumberWorkers" className="text-slate-700 font-medium">
                  Desejados
                </Label>
                <Input
                  id="desiredNumberWorkers"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  {...form.register("desiredNumberWorkers", { valueAsNumber: true })}
                />
                {form.formState.errors.desiredNumberWorkers && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.desiredNumberWorkers.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberWorkerPresent" className="text-slate-700 font-medium">
                  Presente
                </Label>
                <Input
                  id="numberWorkerPresent"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  {...form.register("numberWorkerPresent", { valueAsNumber: true })}
                />
                {form.formState.errors.numberWorkerPresent && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.numberWorkerPresent.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observation" className="text-slate-700 font-medium">
                Observação
              </Label>
              <Textarea
                id="observation"
                placeholder="Digite uma observação..."
                className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white resize-none"
                {...form.register("observation")}
              />
              {form.formState.errors.observation && (
                <p className="text-sm text-red-500 font-medium">
                  {form.formState.errors.observation.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
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
              ) : supervisionToEdit ? (
                "Atualizar Supervisão"
              ) : (
                "Criar Supervisão"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

