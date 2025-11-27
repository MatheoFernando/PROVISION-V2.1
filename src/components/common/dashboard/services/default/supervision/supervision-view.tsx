"use client"

import * as React from "react"
import { Eye, Wrench, Calendar, Clock, User, Building, ListChecks, Users, X } from "lucide-react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="ml-auto flex h-full max-h-screen w-full max-w-4xl flex-col border-l border-slate-200">
        <DrawerHeader className="border-b border-slate-200 bg-slate-50 px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <DrawerTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                <Eye className="h-5 w-5 text-slate-600" />
                Supervisão
              </DrawerTitle>
              <DrawerDescription className="text-sm text-slate-500">
                Visão completa da supervisão e dos recursos envolvidos.
              </DrawerDescription>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={`border text-xs ${statusClass}`}>
                  {detail.status || "Sem status"}
                </Badge>
                <Badge variant="outline" className="border-blue-200 text-xs text-blue-700">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {formatHour(detail.time)}
                </Badge>
                <Badge variant="outline" className="border-slate-200 text-xs text-slate-700">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  {formatDate(detail.createdAt)}
                </Badge>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Resumo Operacional
              </h3>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-md border border-slate-100 bg-slate-50 p-2 flex flex-col items-center justify-center"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Recursos Alocados
              </h3>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
              <Section icon={User} title="Responsável">
                <TextRow label="Funcionário" value="-" />
                <TextRow label="Departamento" value="-" />
              </Section>
              <Section icon={Building} title="Local e Equipamento">
                <TextRow label="Site" value="-" />
                <TextRow label="Equipamento" value="-" />
              </Section>
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Observações e Medidas
              </h3>
            </div>
            <p className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
              {detail.observation || "Nenhuma observação registrada para esta supervisão."}
            </p>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
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
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium text-slate-900 ${valueClass}`}>{value || "—"}</span>
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
      <div className="space-y-2">{children}</div>
    </div>
  )
}

