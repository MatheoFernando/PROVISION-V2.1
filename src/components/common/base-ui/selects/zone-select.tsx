import { useMemo, useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useZones } from "@/infrastructure/hooks/useZones";
import { Zone } from "@/infrastructure/types/domain";


interface ZoneSelectProps {
  value?: string;
  onChange: (value: string) => void;
  onSelectName?: (name: string) => void;
  companyId: string;
  employeeId?: string;
  areaId?: string;
}

export function ZoneSelect({
  value,
  onChange,
  onSelectName,
  companyId,
  employeeId,
  areaId,
}: ZoneSelectProps) {

  const [query, setQuery] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const {
    data: zones = [],
    isLoading,
    refetch,
  } = useZones({ companyId });

  
  useEffect(() => {
    if (value) {
      setSelectedZoneId(value);
      return;
    }
    setSelectedZoneId(null);
  }, [value]);


  const hasArea = Boolean(areaId);

  const list = useMemo(() => {
    return Array.isArray(zones)
      ? zones.filter((zone): zone is Zone => {
        if (!zone?.id) return false;
        const sameCompany =
          String(zone.companyId ?? "") === String(companyId ?? "");
        const hasArea = typeof zone.areaId !== "undefined";
        return sameCompany && hasArea;
      })
      : [];
  }, [companyId, zones]);

  const filtered = useMemo(
    () =>
      !hasArea
        ? []
        : list.filter(
          (zone) =>
            String(zone.areaId ?? "") === String(areaId ?? "") &&
            String(zone.name ?? "")
              .toLowerCase()
              .includes(query.toLowerCase())
        ),
    [areaId, hasArea, list, query]
  );


  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select
          value={selectedZoneId || undefined}
          onValueChange={(selected) => {
            setSelectedZoneId(selected);
            onChange(selected);
            if (onSelectName) {
              const selectedZone = list.find((z) => z.id === selected);
              if (selectedZone?.name) {
                onSelectName(selectedZone.name);
              } else {
                onSelectName("");
              }
            }
          }}
          disabled={isLoading || !hasArea}
          onOpenChange={() => refetch()}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                hasArea ? "Selecione a zona" : "Selecione uma área primeiro"
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
                placeholder="Filtrar zonas..."
                className="w-full placeholder:text-xs"
                disabled={isLoading || !hasArea || list.length === 0}
              />
            </div>
            {!hasArea ? (
              <div className="text-sm text-muted-foreground p-3 text-center">
                Selecione uma área para visualizar zonas.
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
                {filtered.map((z) => (
                  <SelectItem key={z.id} value={z.id!}>
                    {z.name}
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