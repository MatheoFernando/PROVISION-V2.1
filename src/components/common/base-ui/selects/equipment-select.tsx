"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Loader2, Plus, X } from "lucide-react";
import { useEquipment } from "@/infrastructure/hooks/useEquipment";
import EquipmentCreatePage from "@/components/common/dashboard/equipment/equipment-create";
import type { Equipment } from "@/infrastructure/types/domain";

interface EquipmentSelectProps {
  value?: string;
  onChange: (value: string) => void;
}

type EquipmentWithMeta = Equipment & {
  cod?: string;
  createdAt?: string;
};

export function EquipmentSelect({ value, onChange }: EquipmentSelectProps) {
  const [query, setQuery] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createdEquipments, setCreatedEquipments] = React.useState<EquipmentWithMeta[]>([]);
  const { data: equipmentsData, isLoading, refetch } = useEquipment();

  const equipmentList = React.useMemo<EquipmentWithMeta[]>(() => {
    const baseList = (() => {
      if (Array.isArray(equipmentsData)) return equipmentsData;
      if (equipmentsData && typeof equipmentsData === "object") {
        const fallback = equipmentsData as Record<string, EquipmentWithMeta[] | undefined>;
        return (fallback.data ?? fallback.items ?? []) as EquipmentWithMeta[];
      }
      return [];
    })();

    const merged = [...createdEquipments, ...baseList];
    const map = new Map<string, EquipmentWithMeta>();

    merged.forEach((equipment) => {
      if (!equipment?.id) return;
      map.set(equipment.id, {
        ...equipment,
        id: equipment.id,
        cod: (equipment as EquipmentWithMeta).cod ?? "",
        mark: equipment.mark ?? "",
        model: equipment.model ?? "",
        createdAt: equipment.createdAt ?? new Date().toISOString(),
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [createdEquipments, equipmentsData]);

  const filtered = React.useMemo(() => {
    const keyword = query.toLowerCase();
    return equipmentList.filter((equipment) => {
      const text = `${equipment.cod ?? ""} ${equipment.model ?? ""} ${equipment.mark ?? ""} ${
        equipment.serialNumber ?? ""
      }`.toLowerCase();
      return text.includes(keyword);
    });
  }, [equipmentList, query]);

  const handleCloseDrawer = () => {
    setIsCreateOpen(false);
  };

  const handleCreateSuccess = (created?: EquipmentWithMeta) => {
    handleCloseDrawer();
    if (created?.id) {
      const normalizedEquipment: EquipmentWithMeta = {
        ...created,
        id: created.id,
        cod: created.cod ?? "",
        createdAt: created.createdAt ?? new Date().toISOString(),
      };

      setCreatedEquipments((prev) => {
        if (prev.some((item) => item.id === created.id)) return prev;
        return [normalizedEquipment, ...prev];
      });
      onChange(created.id);
    }
    void refetch();
  };

  return (
    <>
      <div className="flex items-stretch gap-2 w-full">
        <div className="flex-1 min-w-0 relative">
          <Select
            value={value ? value : undefined}
            onValueChange={(selected) => onChange(selected)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full ">
              <SelectValue placeholder="Selecione o equipamento" />
            </SelectTrigger>
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
            <SelectContent className="w-[var(--radix-select-trigger-width)] ">
              <div className="p-2 sticky top-0 bg-popover">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filtrar equipamentos..."
                  className="w-full"
                  disabled={isLoading || equipmentList.length === 0}
                />
              </div>
              {filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 text-center">
                  Não há dados disponíveis.
                </div>
              ) : (
                <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                  {filtered.map((equipment) => {
                    if (!equipment?.id) return null;
                    return (
                      <SelectItem
                        key={equipment.id}
                        value={equipment.id}
                        className="cursor-pointer"
                      >
                        <span className="truncate">
                          {equipment.cod || equipment.model || equipment.mark}
                        </span>
                      </SelectItem>
                    );
                  })}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 cursor-pointer"
          onClick={() => setIsCreateOpen(true)}
          aria-label="Criar equipamento"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Drawer
        open={isCreateOpen}
        onOpenChange={(open) => (open ? setIsCreateOpen(true) : handleCloseDrawer())}
        direction="right"
      >
        <DrawerContent className="h-full w-full sm:max-w-xl">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DrawerTitle className="text-2xl font-bold text-foreground">
                    Novo equipamento
                  </DrawerTitle>
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                    aria-label="Fechar drawer de equipamento"
                  >
                    <X className="size-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <EquipmentCreatePage onSuccess={handleCreateSuccess} onCancel={handleCloseDrawer} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
