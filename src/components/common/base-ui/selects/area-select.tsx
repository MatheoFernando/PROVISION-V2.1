import { useState, useEffect, useMemo } from "react";
import { useAreas } from "@/infrastructure/hooks/useAreas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { areaSchema } from "@/infrastructure/schema/schema-area";
import { Area } from "@/infrastructure/types/domain";

type AreaForm = {
  name: string;
  employeeId?: string;
  companyId: string;
};

interface AreaSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
  employeeId?: string;
}

export function AreaSelect({
  value: valueProp,
  onChange,
  companyId,
  employeeId,
}: AreaSelectProps) {
  const value = valueProp && valueProp.trim() !== '' ? valueProp : undefined;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const { data: areas = [], isLoading, isFetching, refetch } = useAreas();

  const form = useForm<AreaForm>({
    resolver: zodResolver(
      areaSchema.pick({ name: true, companyId: true })
    ),
    defaultValues: {
      name: "",
      companyId: companyId,
      employeeId: employeeId,
    },
  });

  useEffect(() => {
    if (value) {
      setSelectedAreaId(value);
    } else {
      setSelectedAreaId(null);
    }
  }, [value]);

  useEffect(() => {
    form.reset({ name: "", companyId, employeeId: employeeId ?? "" });
  }, [companyId, employeeId, form, open]);

 
  const areasList = useMemo<Area[]>(() => {
    const baseList = Array.isArray(areas) ? areas : [];
    const merged: Array<Area & { createdAt?: string }> = [
      ...baseList,
    ];
    const map = new Map<string, Area & { createdAt?: string }>();
    merged.forEach((area) => {
      if (!area?.id) return;
      map.set(area.id, {
        ...area,
        id: area.id,
        name: area.name ?? "",
        createdAt:
          (area as Area & { createdAt?: string }).createdAt ??
          new Date().toISOString(),
      });
    });
    return Array.from(map.values()).sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [areas]);

  const filtered = useMemo(
    () =>
      areasList.filter((a: Area) =>
        String(a?.name ?? "")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [areasList, query]
  );

  useEffect(() => {
    if (value && areasList.length > 0) {
      const areaExists = areasList.some(area => area.id === value);
      if (areaExists) {
        setSelectedAreaId(value);
      }
    }
  }, [value, areasList]);

  const isLoadingOptions = isLoading || isFetching;

  const displayValue = useMemo(() => {
    const normalizedValue = value && value.trim() !== '' ? value : undefined;

    if (!normalizedValue) {
      return undefined;
    }

    const exists = areasList.some(area => area.id === normalizedValue);
    return exists ? normalizedValue : undefined;
  }, [value, areasList]);

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select
          value={displayValue}
          onValueChange={(selected) => {
            setSelectedAreaId(selected);
            onChange(selected);
          }}
          disabled={isLoadingOptions}
          onOpenChange={() => refetch()}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a área" />
          </SelectTrigger>
          {isLoadingOptions && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-1 sticky top-0 bg-popover z-10">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar áreas..."
                className="w-full placeholder:text-xs"
                disabled={isLoadingOptions || areasList.length === 0}
              />
            </div>
            {filtered.length === 0 ? (
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
                {filtered.map((a: Area) => (
                  <SelectItem key={a.id} value={a.id!} className="cursor-pointer">
                    <span className="truncate">{a.name}</span>
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