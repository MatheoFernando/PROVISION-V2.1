"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Equipment } from "@/infrastructure/types/domain";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

interface EquipmentViewProps {
  equipment?: Equipment;
  isOpen: boolean;
  onClose: () => void;
}

export function EquipmentView({ equipment, isOpen, onClose }: EquipmentViewProps) {
  const t = useTranslations("EquipmentView");

  if (!isOpen) return null;
  if (!equipment) return null;

  const resolveStatus = (status?: boolean | string | null) => {
    if (typeof status === "string") return status.toUpperCase() === "ACTIVE";
    return Boolean(status);
  };

  const getStatusColor = (status: boolean) => {
    return status
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
  };

  const getStatusLabel = (status: boolean) => {
    return status ? t("active") : t("inactive");
  };

  const getStatusText = (status?: boolean | string | null) => {
    if (status === undefined || status === null) return "—";
    return getStatusLabel(resolveStatus(status));
  };

  const formatDate = (value?: string | Date) =>
    value ? new Date(value).toLocaleString("pt-BR") : "—";

  const resolveName = (
    value?: { name?: string } | ({ name?: string } | null)[] | null
  ) => {
    if (!value) return undefined;
    if (Array.isArray(value)) {
      const first = value.find((item) => item && item.name);
      return first?.name;
    }
    return value.name;
  };

  const siteCustomerName =
    resolveName(equipment.site?.customers) ?? resolveName(equipment.site?.customer);
  const equipmentStatus = resolveStatus(equipment.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white dark:bg-slate-950  shadow-2xl border-none">

        <DialogHeader className="px-6 py-6 border-b border-gray-100 dark:border-slate-900/50 bg-gray-50/50 dark:bg-slate-900/20">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                {t("title")}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {t("serialString")}: <span className="text-slate-700 dark:text-slate-300 font-mono">{equipment.serialNumber ?? "—"}</span>
                </p>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <Badge
                  variant="secondary"
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(equipmentStatus)}`}
                >
                  {getStatusLabel(equipmentStatus)}
                </Badge>
              </div>
            </div>

          </div>
        </DialogHeader>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          <div className="grid gap-6">

            <SimpleSection title={t("sections.generalInfo")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label={t("fields.mark")} value={equipment.mark} />
                <InfoRow label={t("fields.model")} value={equipment.model} />
                <InfoRow label={t("fields.code")} value={equipment.cod} />
                <InfoRow label={t("fields.company")} value="-" />
              </div>
            </SimpleSection>

            <SimpleSection title={t("sections.siteAndType")}>
              <Tabs defaultValue="site" className="w-full">
                <div className="flex items-center px-1 mb-4">
                  <TabsList className="bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-xl">
                    <TabsTrigger
                      value="site"
                      className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all"
                    >
                      {t("tabs.site")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="type"
                      className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all"
                    >
                      {t("tabs.type")}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="site" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/30 p-5 border border-slate-100 dark:border-slate-800">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InfoRow label={t("fields.code")} value={equipment.site?.cod} />
                      <InfoRow label={t("fields.client")} value={siteCustomerName ?? "—"} />
                      <InfoRow
                        label={t("fields.contractedEmployees")}
                        value={
                          equipment.site?.numberWorkersContract
                            ? String(equipment.site.numberWorkersContract)
                            : "—"
                        }
                      />
                      <InfoRow label={t("fields.status")} value={equipment.site?.status ?? "—"} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="type" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/30 p-5 border border-slate-100 dark:border-slate-800">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InfoRow label={t("fields.name")} value={equipment.typeEquipment?.name} />
                      <InfoRow label={t("fields.description")} value={equipment.typeEquipment?.description} />
                      <InfoRow
                        label={t("fields.status")}
                        value={getStatusText(equipment.typeEquipment?.status)}
                      />
                      <InfoRow label={t("fields.createdAt")} value={formatDate(equipment.typeEquipment?.createdAt)} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </SimpleSection>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SimpleSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 px-1">
        {title}
      </h4>
      {children}
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex flex-col space-y-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 break-words leading-relaxed">
        {value ?? "—"}
      </span>
    </div>
  );
}
