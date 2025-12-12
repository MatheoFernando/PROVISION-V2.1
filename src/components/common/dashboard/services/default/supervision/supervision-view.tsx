"use client"

import * as React from "react"
import {
  Eye, Wrench, Calendar, Clock, User, Building, ListChecks, Hash, Box, Users,
  Pencil
} from "lucide-react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Supervision } from "@/infrastructure/types/domain"
import { useTranslations } from "next-intl"
import { useSupervisionQuery } from "@/infrastructure/hooks/useSupervisions"

interface SupervisionDrawerProps {
  supervision?: Supervision | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (supervision?: Supervision | null) => void
}

type SupervisionWithRelations = Supervision & {
  employee?: { id: string; name?: string; fullName?: string; cod?: string }
  site?: { id: string; name?: string; cod?: string; equipments?: any[] }
  equipment?: { id: string; name?: string; mark?: string; cod?: string }
  department?: { id: string; name?: string }
}

export function SupervisionDrawer({ supervision, isOpen, onOpenChange, onEdit }: SupervisionDrawerProps) {
  const t = useTranslations("Supervision")
  const supervisionId = supervision?.id ?? ""
  const { data: supervisionFromApi } = useSupervisionQuery(supervisionId)
  const detail = (supervisionFromApi ?? supervision) as SupervisionWithRelations | null
  if (!detail) return null

  const isStatusActive = detail.status === 'Finalizado' || detail.status === 'ACTIVE'
  const statusClass = isStatusActive
    ? "bg-green-500 text-white border-green-600"
    : "bg-orange-200 text-red-600"

  const metrics = [
    { label: t("fields.desired"), value: detail.desiredNumberWorkers || "--" },
    { label: t("fields.present"), value: detail.numberWorkerPresent || "--" },
  ]

  // Extract employee data
  const employeeDisplay = detail.employees?.fullName
    ? `${detail.employees.fullName} (${detail.employees.cod || 'N/A'})`
    : 'N/A'

  // Extract department data
  const departmentDisplay = detail.department?.name || detail.employees?.department?.name || 'N/A'

  // Extract site data
  const siteDisplay = detail.sites?.name
    ? `${detail.sites.name} (${detail.sites.cod || 'N/A'})`
    : 'N/A'

  // Extract equipment data - handle both single equipment and array
  const equipmentsList = detail.equipments
    ? [detail.equipments]
    : (detail.sites?.equipments || [])


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white dark:bg-slate-950 shadow-2xl border-none">
        <DialogHeader className="px-6 py-6 border-b border-gray-100 dark:border-slate-900/50 bg-gray-50/50 dark:bg-slate-900/20">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900 dark:text-gray-100">
                <Eye className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                Supervisão #{detail.cod}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                {t("sections.operationalData")}
                <div >
                  <Badge variant={isStatusActive ? 'default' : 'outline'} className={`text-xs px-3 py-1 ${statusClass}`}>
                    {detail.status || t("fields.noStatus")}
                  </Badge>
                </div>
              </DialogDescription>
            </div>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(detail);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="p-0">
          <Tabs defaultValue="details" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 dark:bg-slate-900/50 p-1 rounded-xl">
                <TabsTrigger
                  value="details"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  {t("tabs.details")}
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  {t("tabs.resources")}
                </TabsTrigger>
                <TabsTrigger
                  value="equipments"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  {t("tabs.equipments")}
                </TabsTrigger>
                <TabsTrigger
                  value="observations"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  {t("tabs.observations")}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 h-[450px] overflow-y-auto custom-scrollbar">
              <TabsContent value="details" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 dark:bg-blue-600/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <div className="flex items-center gap-2 mb-2 text-blue-500 dark:text-blue-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">{t("fields.time")}</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {formatHour(detail.time)}
                    </p>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-600/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <div className="flex items-center gap-2 mb-2 text-blue-500 dark:text-blue-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">{t("fields.date")}</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {formatDate(detail.createdAt)}
                    </p>
                  </div>
                </div>

                <section className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ListChecks className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      {t("sections.operationalData")}
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
                  <Section icon={User} title={t("sections.responsible")}>
                    <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                      <DetailBox label={t("fields.responsible")} value={employeeDisplay} icon={User} />
                      <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                      <TextRow label={t("fields.department")} value={departmentDisplay} />
                    </div>
                  </Section>

                  <Section icon={Building} title="Local">
                    <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                      <DetailBox label={t("fields.site")} value={siteDisplay} icon={Building} />
                    </div>
                  </Section>
                </div>
              </TabsContent>

              <TabsContent value="equipments" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={Box} title={t("sections.equipmentDetails")}>
                  {equipmentsList.length > 0 ? (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50 dark:bg-slate-900">
                          <TableRow>
                            <TableHead className="w-[100px]">{t("table.code")}</TableHead>
                            <TableHead>{t("table.name")}</TableHead>
                            <TableHead>{t("table.model")}</TableHead>
                            <TableHead className="text-right">{t("table.status")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {equipmentsList.map((eq: any, idx: number) => (
                            <TableRow key={eq.id || idx}>
                              <TableCell className="font-medium">{eq.cod || "--"}</TableCell>
                              <TableCell>{eq.name || eq.mark || "--"}</TableCell>
                              <TableCell>{eq.model || "--"}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={eq.status ? "default" : "secondary"} className={eq.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                  {eq.status === "ACTIVE" || eq.status === true ? "Ativo" : "Inativo"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                      <Box className="w-8 h-8 mb-2 opacity-50" />
                      <p>{t("messages.noEquipment")}</p>
                    </div>
                  )}
                </Section>
              </TabsContent>

              <TabsContent value="observations" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={Wrench} title={t("tabs.observations")}>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/20 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {detail.observation || t("messages.noObservation")}
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
    <div className="flex justify-between items-center text-sm py-1">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium text-slate-900 dark:text-gray-100 ${valueClass}`}>{value || "—"}</span>
    </div>
  )
}

function DetailBox({ label, value, icon: Icon }: { label: string, value?: string, icon?: any }) {
  return (
    <div className="bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-900 dark:text-gray-100 truncate" title={value}>
        {value || "--"}
      </div>
    </div>
  );
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
    .toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(".", ":")
}

const formatDate = (value?: string | Date) =>
  value ? new Date(value).toLocaleString("pt-BR") : "—";


