import * as React from "react";
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
import { Badge } from "@/components/ui/badge";
import type { Rsu } from "@/infrastructure/types/domain";
import {
  Package,
  Truck,
  User,
  MapPin,
  ClipboardList,
  Box,
  Building,
  Calendar,
  Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useEmployees } from "@/infrastructure/hooks/useEmployees";
import { useSites } from "@/infrastructure/hooks/useSites";

interface RsuDrawerProps {
  rsu: Rsu | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (rsu: Rsu) => void;
}

const formatDate = (value?: string) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function RsuDrawer({ rsu, isOpen, onOpenChange, onEdit }: RsuDrawerProps) {
  const t = useTranslations("Rsu");
  const sitesQuery = useSites();
  const employeesQuery = useEmployees();

  if (!rsu) return null;

  const getStatusColor = (status: string) => {
    if (status === "Finalizado") return "bg-green-500 text-white ";
    return "bg-amber-100 text-amber-800 ";
  };


  const siteName = rsu.site?.name ?? sitesQuery.data?.find(s => s.id === rsu.siteId)?.name ?? rsu.siteId ?? "--";
  const siteCod = rsu.site?.cod ?? sitesQuery.data?.find(s => s.id === rsu.siteId)?.cod ?? "--";
  const siteDisplay = [siteCod, siteName].filter(Boolean).join(" - ");

  const employeeName = rsu.employee?.fullName ?? employeesQuery.data?.find(e => e.id === rsu.employeeId)?.fullName ?? rsu.employeeId ?? "--";
  const employeeCod = rsu.employee?.cod ?? employeesQuery.data?.find(e => e.id === rsu.employeeId)?.cod ?? "--";
  const employeeDisplay = [employeeCod, employeeName].filter(Boolean).join(" - ");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white dark:bg-slate-950 shadow-2xl border-none">
        <DialogHeader className="px-6 py-6 border-b border-gray-100 dark:border-slate-900/50 bg-gray-50/50 dark:bg-slate-900/20">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900 dark:text-gray-100">
                <Box className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                RSU #{rsu.cod}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                Detalhes do RSU
                <div>
                  <Badge variant="outline" className={`text-xs px-3 py-1 ${getStatusColor(rsu.status || "")}`}>
                    {rsu.status || "Sem Status"}
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
                  onEdit(rsu);
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
              <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 dark:bg-slate-900/50 p-1 rounded-xl">
                <TabsTrigger
                  value="details"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  {t("tabs.details")}
                </TabsTrigger>
                <TabsTrigger
                  value="logistics"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  {t("tabs.logistics")}
                </TabsTrigger>
                <TabsTrigger
                  value="observations"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  {t("tabs.observations")}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
              <TabsContent value="details" className="space-y-6 mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 dark:bg-blue-600/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <div className="flex items-center gap-2 mb-2 text-blue-500 dark:text-blue-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">{t("fields.date")}</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {formatDate(rsu.createdAt)}
                    </p>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-600/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <div className="flex items-center gap-2 mb-2 text-blue-500 dark:text-blue-400">
                      <Box className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">{t("fields.quantity")}</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {rsu.quantity ?? 0} un
                    </p>
                  </div>
                </div>

                <Section icon={Package} title={t("sections.loadData")}>
                  <div className="grid grid-cols-1 gap-4">
                    <DetailBox label={t("fields.container")} value={rsu.container?.cod ?? rsu.containerId} icon={Box} />
                  </div>
                </Section>

                <Section icon={MapPin} title={t("sections.location")}>
                  <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                    <DetailBox label={t("fields.site")} value={siteDisplay} icon={Building} />
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="logistics" className="space-y-6 mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={Truck} title={t("sections.transport")}>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailBox label={t("fields.vehicle")} value={rsu.car?.cod ?? rsu.carId} icon={Truck} />
                    <DetailBox label={t("fields.company")} value={rsu.companyId} icon={Building} />
                  </div>
                </Section>

                <Section icon={User} title={t("sections.responsible")}>
                  <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                    <DetailBox label={t("fields.responsible")} value={employeeDisplay} icon={User} />
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="observations" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={ClipboardList} title={t("sections.additionalNotes")}>
                  <div className="bg-gray-50 dark:bg-slate-900/30 p-5 rounded-xl border border-gray-100 dark:border-slate-800 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {rsu.comment || "Nenhuma observação registrada."}
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

function Section({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
      </div>
      <div>{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
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
