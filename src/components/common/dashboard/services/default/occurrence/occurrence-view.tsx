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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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

export function OccurrenceDialog({
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
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="ml-auto flex h-full max-h-screen w-full max-w-5xl flex-col border-l border-slate-200">
        <DrawerHeader className="border-b border-slate-200 bg-slate-50 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DrawerTitle className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Ocorrência #{current.cod}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-slate-500">
                Detalhes completos da ocorrência registrada.
              </DrawerDescription>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-blue-200 text-blue-800"
                >
                  <Clock className="mr-1 h-3.5 w-3.5 text-blue-600" />
                  {formatHour(current.time)}
                </Badge>
                <Badge variant="outline" className={getGravityColor(current.gravity)}>
                  {current.gravity}
                </Badge>
                <Badge variant="outline" className={getStatusColor(current.status)}>
                  {current.status}
                </Badge>
              </div>
            </div>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="size-5 text-blue-600" />
                  Informações Básicas
                </h3>
                <dl className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-600">Código</dt>
                    <dd className="font-semibold text-slate-900">
                      {occurrence.cod}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-600">Tipo</dt>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-600">Horário</dt>
                    <dd>
                      <Badge
                        variant="outline"
                        className="border-blue-200 text-blue-800"
                      >
                        {formatHour(current.time)}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="size-5 text-blue-600" />
                  Ação Corretiva
                </h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {current.correctiveAction ||
                      "Nenhuma ação corretiva definida"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
