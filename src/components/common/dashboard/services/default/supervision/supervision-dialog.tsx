"use client";

import * as React from "react";
import { Eye , Wrench, Calendar } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/infrastructure/utils/api";
import { Supervision } from "@/infrastructure/types/domain";

interface SupervisionDrawerProps {
  supervision: Supervision | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupervisionDrawer({
  supervision,
  isOpen,
  onOpenChange,
}: SupervisionDrawerProps) {
  const { data: company } = useQuery({
    queryKey: ["company", supervision?.companyId],
    queryFn: async () => (await api.get(`/company/${supervision?.companyId}`)).data?.data,
    enabled: !!supervision?.companyId,
  });

  const { data: employee } = useQuery({
    queryKey: ["employee", supervision?.employeeId],
    queryFn: async () => (await api.get(`/employee/${supervision?.employeeId}`)).data?.data,
    enabled: !!supervision?.employeeId,
  });

  const { data: equipment } = useQuery({
    queryKey: ["equipment", supervision?.equipmentId],
    queryFn: async () => (await api.get(`/equipment/${supervision?.equipmentId}`)).data?.data,
    enabled: !!supervision?.equipmentId,
  });

  const { data: site } = useQuery({
    queryKey: ["site", supervision?.siteId],
    queryFn: async () => (await api.get(`/site/${supervision?.siteId}`)).data?.data,
    enabled: !!supervision?.siteId,
  });

  const { data: department } = useQuery({
    queryKey: ["department", supervision?.departmentId],
    queryFn: async () => (await api.get(`/department/${supervision?.departmentId}`)).data?.data,
    enabled: !!supervision?.departmentId,
  });

  if (!supervision) return null;

  const staffDiff =
    supervision.numberWorkerPresent - supervision.desiredNumberWorkers;
  const isStaffAdequate = staffDiff >= 0;

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] border-l bg-white">
        <div className="h-full flex flex-col">
          <DrawerHeader className="border-b px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Eye  className="size-5 text-gray-700" />
                </div>
                <DrawerTitle className="text-base font-medium text-gray-800">
                  Supervisão #{supervision.cod}
                </DrawerTitle>
              </div>

              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  supervision.status === "Ativo"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {supervision.status}
              </span>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {/* Status numérico */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <TextRow label="Desejado" value={supervision.desiredNumberWorkers} />
                <TextRow
                  label="Presente"
                  value={supervision.numberWorkerPresent}
                  valueClass={isStaffAdequate ? "text-green-600" : "text-orange-600"}
                />
                <TextRow
                  label="Diferença"
                  value={`${staffDiff >= 0 ? "+" : ""}${staffDiff}`}
                  valueClass={isStaffAdequate ? "text-green-600" : "text-orange-600"}
                />
              </div>

              <div className="space-y-1.5">
                <TextRow label="Empresa" value={company?.name} />
                <TextRow label="Funcionário" value={employee?.name} />
                <TextRow label="Departamento" value={department?.name} />
              </div>
            </div>

            {/* Mais informações */}
            <div className="grid grid-cols-2 gap-6">
              <TextRow label="Equipamento" value={equipment?.name} />
              <TextRow label="Site" value={site?.name} />
            </div>

            {/* Observação */}
            {supervision.observation && (
              <Section icon={Wrench} title="Observações">
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 border rounded-md p-3">
                  {supervision.observation}
                </p>
              </Section>
            )}

            {/* Histórico */}
            <Section icon={Calendar} title="Histórico">
              <TextRow
                label="Criado"
                value={new Date(supervision.createdAt).toLocaleString("pt-BR")}
              />
              <TextRow
                label="Atualizado"
                value={new Date(supervision.updatedAt).toLocaleString("pt-BR")}
              />
            </Section>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function TextRow({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: any;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium text-gray-800 truncate ${valueClass}`}>
        {value || "—"}
      </span>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-gray-400" />
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}
