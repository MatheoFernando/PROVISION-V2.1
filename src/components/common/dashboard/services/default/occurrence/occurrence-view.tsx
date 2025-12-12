"use client";

import * as React from "react";
import {
  AlertTriangle,
  Building,
  User,
  Wrench,
  Clock,
  FileText,
  List,
  Calendar,
  Box,
  Hash,
  Pencil
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Occurrence } from "@/infrastructure/schema/schema-occurrence";
import { useOccurrence } from "@/infrastructure/hooks/useOccurrences";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Occorrence } from "@/infrastructure/types/domain";

interface OccurrenceDialogProps {
  occurrence: Occurrence;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (occurrence: Occorrence) => void;
}

const formatHour = (value?: string) => {
  if (!value) return "--";
  if (value.includes("T") && Number.isNaN(Date.parse(value))) {
    const fallback = value.includes(":") ? value : `${value}:00`;
    return fallback.slice(0, 5);
  }
  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${new Date().toISOString().slice(0, 10)}T${value}`);
  if (Number.isNaN(date.getTime())) {
    const fallback = value.includes(":") ? value : `${value}:00`;
    return fallback.slice(0, 5);
  }
  return date
    .toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(".", ":");
};

const formatDateTime = (value?: string) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function OccurrenceViewDrawer({
  occurrence,
  isOpen,
  onOpenChange,
  onEdit,
}: OccurrenceDialogProps) {
  const t = useTranslations("Occurrence");
  const tSupervision = useTranslations("Supervision");
  const { data: occurrenceFromApi } = useOccurrence(occurrence?.id ?? "");
  const current = occurrenceFromApi ?? occurrence;

  const typeOccurrenceName = (current as any)?.typeOccorence?.description || "N/A";
  const employeeDisplay = (current as any)?.employees?.fullName || "N/A";
  const companyName = (current as any)?.companies?.businessName || "N/A";
  const siteDisplay = (current as any)?.sites?.name
    ? `${(current as any)?.sites?.name} (${(current as any)?.sites?.cod || "--"})`
    : "N/A";

  const equipmentsList = (current as any)?.equipments
    ? [(current as any)?.equipments]
    : [];

  const getGravityColor = (gravity: string) => {
    switch (gravity) {
      case "Alta":
        return "bg-red-500 text-white border-red-600";
      case "Média":
        return "bg-orange-200 text-red-500 border-orange-300";
      case "Baixa":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-200 text-gray-500 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aberto":
        return "bg-red-100 text-red-800 border-red-200";
      case "Em Andamento":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Fechado":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Ativo":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Inativo":
        return "bg-gray-200 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white dark:bg-slate-950 shadow-2xl border-none">
        <DialogHeader className="px-6 py-6 border-b border-gray-100 dark:border-slate-900/50 bg-gray-50/50 dark:bg-slate-900/20">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900 dark:text-gray-100">
                <AlertTriangle className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                Ocorrência #{current.cod}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                {t("sections.basicData")}
                <div>
                  <Badge variant="outline" className={`border text-xs px-3 py-1 ${getStatusColor(current.status)}`}>
                    {current.status}
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
                  onEdit(current as Occorrence);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="p-0">
          <Tabs defaultValue="info" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-5 bg-gray-100/50 dark:bg-slate-900/50 p-1 rounded-xl">
                <TabsTrigger
                  value="info"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  {t("tabs.info")}
                </TabsTrigger>
                <TabsTrigger
                  value="context"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  {t("tabs.context")}
                </TabsTrigger>
                <TabsTrigger
                  value="equipments"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  {t("tabs.equipments")}
                </TabsTrigger>
                <TabsTrigger
                  value="actions"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  {t("tabs.actions")}
                </TabsTrigger>
                <TabsTrigger
                  value="description"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  {t("tabs.description")}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 h-[450px] overflow-y-auto custom-scrollbar">
              <TabsContent value="info" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 dark:bg-blue-600/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <div className="flex items-center gap-2 mb-2 text-blue-500 dark:text-blue-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">{t("fields.time")}</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {formatHour(current.time)}
                    </p>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-600/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <div className="flex items-center gap-2 mb-2 text-blue-500 dark:text-blue-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">{t("fields.date")}</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {formatDateTime(current.createdAt)}
                    </p>
                  </div>
                </div>

                <Section icon={FileText} title={t("sections.basicData")}>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailBox label={t("fields.type")} value={typeOccurrenceName} />
                    <div className="bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        {t("fields.gravity")}
                      </div>
                      <Badge variant="outline" className={`border text-xs ${getGravityColor(current.gravity)}`}>
                        {current.gravity}
                      </Badge>
                    </div>
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="context" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">

                <Section icon={User} title={t("sections.responsible")}>
                  <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                    <DetailBox label={t("fields.employee")} value={employeeDisplay} icon={User} />
                    <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                    <TextRow label={t("fields.company")} value={companyName} />
                  </div>
                </Section>

                <Section icon={Building} title={t("sections.localEquipment")}>
                  <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                    <DetailBox label={t("fields.site")} value={siteDisplay} icon={Building} />
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="equipments" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={Box} title={t("sections.localEquipment")}>
                  {equipmentsList.length > 0 ? (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50 dark:bg-slate-900">
                          <TableRow>
                            <TableHead className="w-[100px]">{tSupervision("table.code")}</TableHead>
                            <TableHead>{tSupervision("table.name")}</TableHead>
                            <TableHead>{tSupervision("table.model")}</TableHead>
                            <TableHead className="text-right">{tSupervision("table.status")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {equipmentsList.map((eq: any, idx: number) => (
                            <TableRow key={eq.id || idx}>
                              <TableCell className="font-medium">{eq.cod || "--"}</TableCell>
                              <TableCell>{eq.name || eq.mark || "--"}</TableCell>
                              <TableCell>{eq.model || "--"}</TableCell>
                              <TableCell className="text-right">
                                {eq.status !== undefined ? (
                                  <Badge variant={eq.status ? "default" : "secondary"} className={eq.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                    {eq.status ? "Ativo" : "Inativo"}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400">--</span>
                                )}
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

              <TabsContent value="actions" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={Wrench} title={t("sections.adoptedMeasures")}>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/20 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {current.correctiveAction || t("messages.noAction")}
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="description" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={List} title={t("sections.eventDescription")}>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/20 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {current.description || "Nenhuma descrição disponível."}
                  </div>
                </Section>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>, title: string, children: React.ReactNode }) {
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
