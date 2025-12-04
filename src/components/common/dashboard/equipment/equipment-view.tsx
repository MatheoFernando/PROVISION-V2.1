"use client";

import type { ReactNode } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, X } from "lucide-react";
import { Equipment } from "@/infrastructure/types/domain";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface EquipmentViewProps {
  equipment?: Equipment;
  isOpen: boolean;
  onClose: () => void;
}

export function EquipmentView({ equipment, isOpen, onClose }: EquipmentViewProps) {
  if (!isOpen) return null;
  if (!equipment) return null;

  const resolveStatus = (status?: boolean | string | null) => {
    if (typeof status === "string") return status.toUpperCase() === "ACTIVE";
    return Boolean(status);
  };

  const getStatusColor = (status: boolean) => {
    return status
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: boolean) => {
    return status ? "Ativo" : "Inativo";
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
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-full w-full sm:max-w-4xl lg:max-w-5xl">
        <div className="flex h-full flex-col">
          <DrawerHeader className="border-b border-border bg-muted/40 px-6 py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
              <DrawerTitle className="flex items-center gap-3 text-2xl font-semibold text-foreground">
                <Eye className="h-5 w-5 text-muted-foreground" />
                Detalhes do Equipamento 
              </DrawerTitle>
            
                <div className="flex items-center gap-2 ">
                <p className="text-sm tracking-wider text-muted-foreground">
                  Número de Série: {equipment.serialNumber ?? "—"}
                </p>
              
             
              <div >
                <Badge className={getStatusColor(equipmentStatus)}>
                  {getStatusLabel(equipmentStatus)}
                </Badge>
               
              </div>
              </div>
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-foreground"
                >
                  <span className="sr-only">Fechar</span>
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            <SimpleSection title="Informações Gerais">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoRow label="Marca" value={equipment.mark} />
                <InfoRow label="Modelo" value={equipment.model} />
                <InfoRow label="Código" value={equipment.cod} />
                <InfoRow label="Empresa" value="-" />
               
              </div>
            </SimpleSection>

          

            <SimpleSection title="Detalhes do Site e Tipo">
              <Tabs defaultValue="site" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="site" className="cursor-pointer">Site</TabsTrigger>
                  <TabsTrigger value="type" className="cursor-pointer">Tipo de Equipamento</TabsTrigger>
                </TabsList>
                <TabsContent value="site">
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoRow label="Código" value={equipment.site?.cod} />
                    <InfoRow label="Cliente" value={siteCustomerName ?? "—"} />
                    <InfoRow
                      label="Funcionários Contratados"
                      value={
                        equipment.site?.numberWorkersContract
                          ? String(equipment.site.numberWorkersContract)
                          : "—"
                      }
                    />
                    <InfoRow label="Setor" value="-" />
                    <InfoRow label="Zona" value="-" />
                    <InfoRow label="Status" value={equipment.site?.status ?? "—"} />
                  </div>
                </TabsContent>
                <TabsContent value="type">
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoRow label="Nome" value={equipment.typeEquipment?.name} />
                    <InfoRow label="Descrição" value={equipment.typeEquipment?.description} />
                    <InfoRow
                      label="Status"
                      value={getStatusText(equipment.typeEquipment?.status)}
                    />
                    <InfoRow label="Criado em" value={formatDate(equipment.typeEquipment?.createdAt)} />
                  </div>
                </TabsContent>
              </Tabs>
            </SimpleSection>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function SimpleSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-border/70 bg-white/70 p-4">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
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
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-base font-medium text-foreground">
        {value ?? "—"}
      </span>
    </div>
  );
}
