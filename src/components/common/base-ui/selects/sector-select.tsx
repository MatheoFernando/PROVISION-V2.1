import { useMemo, useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useSectors } from "@/infrastructure/hooks/useSectors";
import { Sector } from "@/infrastructure/types/domain";
import { Input } from "@/components/ui/input";

interface SectorSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
  employeeId?: string;
  zoneId?: string;
}

export function SectorSelect({
  value,
  onChange,
  companyId,
  employeeId,
  zoneId,
}: SectorSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const {
    data: sectors = [],
    isLoading,
    refetch,
  } = useSectors({ companyId });
  
  useEffect(() => {
    if (value) {
      setSelectedSectorId(value);
    }
  }, [value]);

 
  const hasZone = Boolean(zoneId);
  const list = useMemo(() => {
    return Array.isArray(sectors)
      ? sectors.filter((sector): sector is Sector => {
        if (!sector?.id) return false;
        const sameCompany =
          String(sector.companyId ?? "") === String(companyId ?? "");
        return sameCompany;
      })
      : [];
  }, [companyId, sectors]);

  const filtered = useMemo(
    () =>
      !hasZone
        ? []
        : list.filter(
          (sector) =>
            String(sector.zoneId ?? "") === String(zoneId ?? "") &&
            String(sector.name ?? "")
              .toLowerCase()
              .includes(query.toLowerCase())
        ),
    [hasZone, list, query, zoneId]
  );

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select
          value={selectedSectorId || undefined}
          onValueChange={(selected) => {
            setSelectedSectorId(selected);
            onChange(selected);
          }}
          disabled={isLoading || !hasZone}
          onOpenChange={() => refetch()}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                hasZone ? "Selecione o setor" : "Selecione uma zona primeiro"
              }
            />
          </SelectTrigger>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-1 sticky top-0 bg-popover z-10">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar setores..."
                className="w-full placeholder:text-xs"
                disabled={isLoading || !hasZone || list.length === 0}
              />
            </div>
            {!hasZone ? (
              <div className="text-sm text-muted-foreground p-3 text-center">
                Selecione uma zona para visualizar setores.
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">
                Não há dados disponíveis.
              </div>
            ) : (
              <div
                className={
                  filtered.length > 7
                    ? "max-h-60 overflow-y-auto"
                    : "max-h-full"
                }
              >
                {filtered.map((s) => (
                  <SelectItem key={s.id} value={s.id!}>
                    {s.name}
                  </SelectItem>
                ))}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    
    </div>
  );
}