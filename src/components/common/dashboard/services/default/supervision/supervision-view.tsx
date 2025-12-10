"use client"

import * as React from "react"
import { Eye, Wrench, Calendar, Clock, User, Building, ListChecks, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Supervision } from "@/infrastructure/types/domain"
import { useSupervisionQuery } from "@/infrastructure/hooks/useSupervisions"

interface SupervisionWithRelations extends Supervision {
  employee?: { fullName?: string; name?: string } | null
  site?: { name?: string; cod?: string } | null
  equipment?: { cod?: string; model?: string; mark?: string } | null
  department?: { name?: string } | null
}

interface SupervisionDrawerProps {
  supervision: Supervision | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const statusStyles: Record<string, string> = {
  Finalizado: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Planeado: "bg-blue-100 text-blue-800 border-blue-200",
  Pendente: "bg-amber-100 text-amber-800 border-amber-200",
  "Em Curso": "bg-orange-100 text-orange-800 border-orange-200",
}

const formatHour = (value?: string) => {
  if (!value) return "--"
  if (value.includes("T") && Number.isNaN(Date.parse(value))) {
    const fallback = value.includes(":") ? value : `${value}:00`
    return fallback.slice(0, 5)
  }
  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${new Date().toISOString().slice(0, 10)}T${value}`)
  if (Number.isNaN(date.getTime())) {
    const fallback = value.includes(":") ? value : `${value}:00`
    return fallback.slice(0, 5)
  }
  return date
    .toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(".", ":")
}

const formatDate = (value?: string) => {
  if (!value) return "--"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function SupervisionDrawer({ supervision, isOpen, onOpenChange }: SupervisionDrawerProps) {
  const supervisionId = supervision?.id ?? ""
  const { data: supervisionFromApi } = useSupervisionQuery(supervisionId)
  const detail = (supervisionFromApi ?? supervision) as SupervisionWithRelations | null

  if (!detail) return null

  const statusClass = statusStyles[detail.status ?? ""] ?? "bg-slate-100 text-slate-700 border-slate-200"

  const metrics = [
    { label: "Desejado", value: detail.desiredNumberWorkers || "--" },
    { label: "Presentes", value: detail.numberWorkerPresent || "--" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border-none">
        <DialogHeader className="px-6 py-6 border-b border-gray-100 dark:border-slate-900/50 bg-gray-50/50 dark:bg-slate-900/20">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900 dark:text-gray-100">
                <Eye className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                Supervisão
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Visão completa da supervisão e dos recursos envolvidos.
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className={`border text-xs ${statusClass}`}>
                {detail.status || "Sem status"}
              </Badge>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-blue-200 text-xs text-blue-700 bg-blue-50">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {formatHour(detail.time)}
                </Badge>
                <Badge variant="outline" className="border-slate-200 text-xs text-slate-700 bg-slate-50">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  {formatDate(detail.createdAt)}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-0">
          <Tabs defaultValue="summary" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 dark:bg-slate-900/50 p-1 rounded-xl">
                <TabsTrigger
                  value="summary"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Resumo
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Recursos
                </TabsTrigger>
                <TabsTrigger
                  value="observations"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Observações
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 h-[400px] overflow-y-auto">
              <TabsContent value="summary" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <section className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ListChecks className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Resumo Operacional
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    {metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-xl bg-white dark:bg-slate-900/50 p-4 shadow-sm border border-slate-100 dark:border-slate-800"
                      >
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                          {metric.label}
                        </p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="resources" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 gap-6">
                  <Section icon={User} title="Responsável">
                    <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                      <TextRow label="Funcionário" value={detail.employee?.fullName || detail.employee?.name || detail.employeeId} />
                      <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                      <TextRow label="Departamento" value={detail.department?.name || detail.departmentId} />
                    </div>
                  </Section>

                  <Section icon={Building} title="Local e Equipamento">
                    <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                      <TextRow label="Site" value={detail.site?.name || detail.site?.cod || detail.siteId} />
                      <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                      <TextRow
                        label="Equipamento"
                        value={
                          detail.equipment
                            ? `${detail.equipment.cod || ''} ${detail.equipment.model || ''}`
                            : detail.equipmentId
                        }
                      />
                    </div>
                  </Section>
                </div>
              </TabsContent>

              <TabsContent value="observations" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={Wrench} title="Observações e Medidas">
                  <div className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-100 dark:border-amber-900/20 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {detail.observation || "Nenhuma observação registrada para esta supervisão."}
                  </div>
                </Section>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TextRow({
  label,
  value,
  valueClass = "",
}: {
  label: string
  value?: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium text-slate-900 dark:text-gray-100 ${valueClass}`}>{value || "—"}</span>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
      </div>
      <div>{children}</div>
    </div>
  )
}

