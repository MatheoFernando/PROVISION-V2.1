"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Rsu } from "@/infrastructure/types/domain";
import {
  Package,
  Truck,
  User,
  MapPin,
  ClipboardList,
  CalendarClock,
} from "lucide-react";

interface RsuDrawerProps {
  rsu: Rsu | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RsuDrawer({ rsu, isOpen, onOpenChange }: RsuDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed right-0 top-0 bottom-0 w-full bg-background text-foreground shadow-2xl sm:w-[420px]">
        <div className="flex h-full flex-col">
          <DrawerHeader className="border-b border-border px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DrawerTitle className="text-xl font-semibold">
                  RSU {rsu?.cod ?? "—"}
                </DrawerTitle>
                <DrawerDescription className="text-sm text-muted-foreground">
                  Detalhes da recolha seletiva
                </DrawerDescription>
              </div>
              {rsu?.status && (
                <Badge
                  variant={
                    rsu.status === "Finalizado" ? "default" : "secondary"
                  }
                  className={
                    rsu.status === "Finalizado"
                      ? "bg-emerald-500"
                      : "bg-amber-100 text-amber-800"
                  }
                >
                  {rsu.status}
                </Badge>
              )}
            </div>
          </DrawerHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <Section icon={Package} title="Carga">
              <DetailRow
                label="Contentor"
                value={rsu?.container?.cod ?? rsu?.containerId ?? "—"}
              />
              <DetailRow label="Quantidade" value={`${rsu?.quantity ?? 0} un`} />
            </Section>

            <Separator />

            <Section icon={Truck} title="Logística">
              <DetailRow
                label="Viatura"
                value={rsu?.car?.cod ?? rsu?.carId ?? "—"}
              />
              <DetailRow label="Empresa" value={rsu?.companyId ?? "—"} />
            </Section>

            <Separator />

            <Section icon={User} title="Responsável">
              <DetailRow
                label="Funcionário"
                value={rsu?.employee?.fullName ?? rsu?.employeeId ?? "—"}
              />
            </Section>

            <Section icon={MapPin} title="Local">
              <DetailRow
                label="Site"
                value={rsu?.site?.name ?? rsu?.siteId ?? "—"}
              />
            </Section>

            <Section icon={ClipboardList} title="Observações">
              <DetailRow label="Comentário" value={rsu?.comment || "—"} />
            </Section>

            <Section icon={CalendarClock} title="Registos">
              <DetailRow
                label="Criado em"
                value={
                  rsu?.createdAt ? formatDateTime(rsu.createdAt) : "—"
                }
              />
              <DetailRow
                label="Atualizado em"
                value={
                  rsu?.updatedAt ? formatDateTime(rsu.updatedAt) : "—"
                }
              />
            </Section>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-foreground">
        {value || "—"}
      </span>
    </div>
  );
}

interface SectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}

function Section({ icon: Icon, title, children }: SectionProps) {
  return (
    <div className="space-y-3 rounded-xl bg-muted/40 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-4" />
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function formatDateTime(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input ?? "—";
  return date.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

