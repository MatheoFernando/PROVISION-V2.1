"use client";

import type { ComponentType, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Address,
  Contact,
  Customer,
  Site,
  Zone,
  Sector,
} from "@/infrastructure/types/domain";
import { Building2, Eye, MapPin, Phone, User2, X } from "lucide-react";

interface SitesViewProps {
  isOpen: boolean;
  onClose: () => void;
  site?: Site;
}

interface InfoRow {
  label: string;
  value?: ReactNode;
  emphasis?: boolean;
}

interface InfoBlock {
  icon: ComponentType<{ className?: string }>;
  title: string;
  rows: InfoRow[];
}

interface Metric {
  label: string;
  value: string;
}

function pickFirstEntity<T extends object>(
  primary?: T | (T | null)[] | null,
  fallback?: T | null
): T | undefined {
  if (Array.isArray(primary)) {
    const found = primary.find(Boolean);
    if (found) return found as T;
  } else if (primary) {
    return primary;
  }
  return fallback ?? undefined;
}

function hasCreatedAt(
  entity: Site
): entity is Site & { createdAt?: string | Date } {
  return "createdAt" in entity;
}

function formatDate(value?: string | Date) {
  if (!value) return "--";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function SitesView({ isOpen, onClose, site }: SitesViewProps) {
  if (!site) return null;

  const zone = pickFirstEntity<Zone>(site.zones, site.zone);
  const sector = pickFirstEntity<Sector>(site.sectors, site.sector);
  const address = pickFirstEntity<Address>(site.addresses, site.address);
  const customer = pickFirstEntity<Customer>(site.customers, site.customer);
  const contact = pickFirstEntity<Contact>(site.contacts, site.contact);

  const primaryPhone = contact?.phoneNumbers?.[0]?.phone ?? "-";
  const createdAt = hasCreatedAt(site) ? formatDate(site.createdAt) : "--";
  const addressSummary =
    [address?.houseHold, address?.municipality].filter(Boolean).join(", ") ||
    "-";

  const metrics: Metric[] = [
    {
      label: "Trabalhadores",
      value: String(site.numberWorkersContract ?? "--"),
    },
  ];

  const infoBlocks: InfoBlock[] = [
    {
      icon: MapPin,
      title: "Localização",
      rows: [
        { label: "Zona", value: zone?.name ?? "-" },
        { label: "Setor", value: sector?.name ?? "-" },
        { label: "Endereço", value: addressSummary },
      ],
    },
    {
      icon: Building2,
      title: "Cliente",
      rows: [
        { label: "Empresa", value: customer?.name ?? "-" },
        { label: "Código do Site", value: site.cod ?? "-" },
        { label: "Email Comercial", value: contact?.email ?? "-" },
      ],
    },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="ml-auto flex h-full max-h-screen w-full max-w-3xl flex-col border-l border-border">
        <DrawerHeader className="border-b border-border bg-muted/40 px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <DrawerTitle className="flex items-center gap-3 text-2xl font-semibold text-foreground">
                <Eye className="h-5 w-5 text-muted-foreground" />
                Detalhes do Site
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                Visão consolidada das principais informações do site.
              </DrawerDescription>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-2 border-primary/40 text-primary"
                >
                  <User2 className="h-3.5 w-3.5" />
                  {customer?.name ?? "Sem cliente"}
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-2 border-muted-foreground/30 text-muted-foreground"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {createdAt.toString() ?? "sem data de criação"}
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-2 border-muted-foreground/30 text-muted-foreground"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {primaryPhone}
                </Badge>
                <div>
                  {metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-md flex gap-2 border   p-1 "
                    >
                      <p className="text-xs font-medium tracking-wide text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:bg-muted"
              >
                <span className="sr-only">Fechar</span>
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="grid gap-4 ">
            {infoBlocks.map((block) => (
              <InfoSection key={block.title} {...block} />
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function InfoSection({ icon: Icon, title, rows }: InfoBlock) {
  return (
    <section className="rounded-xl border border-border p-3 ">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <h3 className="text-xs font-semibold tracking-wide">{title}</h3>
      </div>
      <div className="mt-4 space-y-3  grid gap-4 grid-cols-2">
        {rows.map((row) => (
          <TextRow key={row.label} {...row} />
        ))}
      </div>
    </section>
  );
}

function TextRow({ label, value, emphasis }: InfoRow) {
  const valueClasses = emphasis
    ? "text-base font-semibold"
    : "text-sm font-medium";
  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="text-xs tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={`${valueClasses} text-foreground`}>{value ?? "-"}</span>
    </div>
  );
}
