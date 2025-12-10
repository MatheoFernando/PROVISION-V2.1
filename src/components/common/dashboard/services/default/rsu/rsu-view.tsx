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
import { Separator } from "@/components/ui/separator";
import type { Rsu } from "@/infrastructure/types/domain";
import {
  Package,
  Truck,
  User,
  MapPin,
  ClipboardList,
} from "lucide-react";

interface RsuDrawerProps {
  rsu: Rsu | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RsuDrawer({ rsu, isOpen, onOpenChange }: RsuDrawerProps) {
  if (!rsu) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border-none">
        <DialogHeader className="px-6 py-6 border-b border-gray-100 dark:border-slate-900/50 bg-gray-50/50 dark:bg-slate-900/20">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                RSU {rsu.cod}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Detalhes da recolha seletiva
              </DialogDescription>
            </div>
            {rsu.status && (
              <Badge
                variant="outline"
                className={
                  rsu.status === "Finalizado"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }
              >
                {rsu.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="p-0">
          <Tabs defaultValue="details" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 dark:bg-slate-900/50 p-1 rounded-xl">
                <TabsTrigger
                  value="details"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Detalhes
                </TabsTrigger>
                <TabsTrigger
                  value="logistics"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Logística
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
              <TabsContent value="details" className="space-y-6 mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={Package} title="Dados da Carga">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailBox label="Contentor" value={rsu.container?.cod ?? rsu.containerId ?? "—"} />
                    <DetailBox label="Quantidade" value={`${rsu.quantity ?? 0} un`} />
                  </div>
                </Section>

                <Section icon={MapPin} title="Localização">
                  <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                    <DetailRow label="Site" value={rsu.site?.name ?? rsu.siteId ?? "—"} />
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="logistics" className="space-y-6 mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={Truck} title="Transporte">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailBox label="Viatura" value={rsu.car?.cod ?? rsu.carId ?? "—"} />
                    <DetailBox label="Empresa" value={rsu.companyId ?? "—"} />
                  </div>
                </Section>

                <Section icon={User} title="Responsável">
                  <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                    <DetailRow label="Funcionário" value={rsu.employee?.fullName ?? rsu.employeeId ?? "—"} />
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="observations" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Section icon={ClipboardList} title="Notas Adicionais">
                  <div className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-100 dark:border-amber-900/20 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
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
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</span>
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

