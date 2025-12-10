"use client";

import * as React from "react";
import {
  AlertTriangle,
  Building,
  User,
  Wrench,
  MapPin,
  Clock,
  FileText,
  Shield,
  X,
  List,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { Occurrence } from "@/infrastructure/schema/schema-occurrence";
import { useTypeOccurrences } from "@/infrastructure/hooks/useTypeOccurrences";
import { useOccurrence } from "@/infrastructure/hooks/useOccurrences";

interface OccurrenceDialogProps {
  occurrence: Occurrence;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function OccurrenceViewDrawer({
  occurrence,
  isOpen,
  onOpenChange,
}: OccurrenceDialogProps) {
  const { data: typeOccurrences } = useTypeOccurrences();
  const { data: occurrenceFromApi } = useOccurrence(occurrence?.id ?? "");
  const current = occurrenceFromApi ?? occurrence;

  const companyName =
    (current as any)?.company?.businessName ||
    (current as any)?.company?.name ||
    current.companyId ||
    "N/A";

  const employeeName =
    (current as any)?.employee?.fullName ||
    (current as any)?.employee?.name ||
    current.employeeId ||
    "N/A";

  const equipmentName =
    (current as any)?.equipment?.cod ||
    (current as any)?.equipment?.name ||
    current.equipmentId ||
    "Sem equipamento";

  const siteName =
    (current as any)?.site?.name ||
    (current as any)?.site?.cod ||
    current.siteId ||
    "N/A";

  const typeOccurrenceName = (() => {
    const typeId =
      current.typeOccorrenceId ||
      (current as any)?.typeOccurrenceId ||
      (current as any)?.typeOccorrence?.id;
    if (!typeId) return "N/A";
    const fromApi = typeOccurrences?.find((t) => t.id === typeId);
    return fromApi?.description || typeId;
  })();

  const getGravityColor = (gravity: string) => {
    switch (gravity) {
      case "Alta":
        return "bg-red-100 text-red-800 border-red-200";
      case "Média":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Baixa":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aberto":
        return "bg-red-100 text-red-800 border-red-200";
      case "Em Andamento":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Fechado":
        return "bg-green-100 text-green-800 border-green-200";
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
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border-none">
        <DialogHeader className="px-6 py-6 border-b border-gray-100 dark:border-slate-900/50 bg-gray-50 text-white dark:bg-slate-900/20">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-2xl font-semibold text-slate-900 dark:text-gray-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Ocorrência #{current.cod}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Detalhes completos da ocorrência registrada.
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <Badge variant="outline" className={getGravityColor(current.gravity)}>
                  {current.gravity}
                </Badge>
                <Badge variant="outline" className={getStatusColor(current.status)}>
                  {current.status}
                </Badge>
              </div>
              <Badge variant="outline" className="border-blue-200 text-blue-800 bg-blue-50 text-xs">
                <Clock className="mr-1 h-3.5 w-3.5 text-blue-600" />
                {formatHour(current.time)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="p-0">
          <Tabs defaultValue="info" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 dark:bg-slate-900/50 p-1 rounded-xl">
                <TabsTrigger
                  value="info"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Informações
                </TabsTrigger>
                <TabsTrigger
                  value="context"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Contexto
                </TabsTrigger>
                <TabsTrigger
                  value="actions"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Ação Corretiva
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 h-[400px] overflow-y-auto">
              <TabsContent value="info" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={FileText} title="Dados Básicos">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailBox label="Código" value={current.cod} />
                    <DetailBox label="Tipo" value={typeOccurrenceName} />
                    <DetailBox label="Horário" value={formatHour(current.time)} />
                    <DetailBox label="Data" value={formatDateTime(current.createdAt)} />
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="context" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={Building} title="Local e Equipamento">
                  <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                    <DetailRow label="Site" value={siteName} />
                    <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                    <DetailRow label="Equipamento" value={equipmentName} />
                  </div>
                </Section>

                <Section icon={User} title="Responsável">
                  <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                    <DetailRow label="Funcionário" value={employeeName} />
                    <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                    <DetailRow label="Empresa" value={companyName} />
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="actions" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={Wrench} title="Medidas Adotadas">
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/20 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {current.correctiveAction || "Nenhuma ação corretiva definida."}
                  </div>
                </Section>

                {current.description && (
                  <Section icon={List} title="Descrição do Evento">
                    <div className="bg-gray-50 dark:bg-slate-900/30 p-5 rounded-xl border border-gray-100 dark:border-slate-800 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {current.description}
                    </div>
                  </Section>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <Icon className="w-4 h-4" />
        {title}
      </div>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right">{value}</span>
    </div>
  );
}

function DetailBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-slate-900/30 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={value}>{value}</div>
    </div>
  );
}
