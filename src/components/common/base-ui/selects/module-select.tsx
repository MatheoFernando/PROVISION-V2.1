import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCompanyModules } from "@/infrastructure/hooks/useCompanyModules";
import { CompanyModuleWithDetails } from "@/infrastructure/schema/schema-company-module";

interface ModuleSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string | null;
  className?: string;
}

export function ModuleSelect({
  value: valueProp,
  onChange,
  companyId,
  className
}: ModuleSelectProps) {
  const value = valueProp && valueProp.trim() !== '' ? valueProp : undefined;

  const [query, setQuery] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  
  const normalizedCompanyId = companyId ?? "";
  const { data: modules = [], isLoading, isFetching } = useCompanyModules({ 
      companyId: normalizedCompanyId,
      status: true // Only active modules?
  });

  useEffect(() => {
    if (value) {
      setSelectedModuleId(value);
    } else {
      setSelectedModuleId(null);
    }
  }, [value]);

  const modulesList = useMemo(() => {
    if (!Array.isArray(modules)) return [];
   
    return [...modules].sort((a: any, b: any) => {
         const nameA = a.module?.name || a.modules?.name || a.Module?.name || a.name || a.Name || "";
         const nameB = b.module?.name || b.modules?.name || b.Module?.name || b.name || b.Name || "";
         return nameA.localeCompare(nameB);
    });
  }, [modules]);

  const filtered = useMemo(
    () =>
      modulesList.filter((item: any) => {
        const name = item.module?.name || item.modules?.name || item.Module?.name || item.name || item.Name || "";
        return String(name)
          .toLowerCase()
          .includes(query.toLowerCase());
      }),
    [modulesList, query]
  );

  useEffect(() => {
    if (value && modulesList.length > 0) {
      // Find based on ID (moduleId)
      const exists = modulesList.some((m: any) => {
           const realId = m.moduleId || m.modules?.id || m.module?.id || m.id;
           return realId === value;
      });
      if (exists) {
        setSelectedModuleId(value);
      }
    }
  }, [value, modulesList]);

  const handleValueChange = (val: string) => {
      setSelectedModuleId(val);
      onChange(val);
  }

  const isLoadingOptions = isLoading || isFetching;

  const displayValue = useMemo(() => {
    if (!value) return undefined;
    const found = modulesList.find((m: any) => {
        const realId = m.moduleId || m.modules?.id || m.module?.id || m.id;
        return realId === value;
    });
    return found ? value : undefined;
  }, [value, modulesList]);

  return (
    <div className={`flex flex-col gap-2 w-full ${className || ''}`}>
      <div className="flex-1 min-w-0 relative w-full">
        <Select
          value={displayValue}
          onValueChange={handleValueChange}
          disabled={isLoadingOptions && modulesList.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o módulo (Opcional)" />
          </SelectTrigger>
          {isLoadingOptions && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-1 sticky top-0 bg-popover z-10">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar módulos..."
                className="w-full placeholder:text-xs"
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">
                Não há módulos encontrados.
              </div>
            ) : (
              <div
                className={
                  filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"
                }
              >
                
                <SelectItem value="CLEAR_SELECTION" className="text-muted-foreground italic cursor-pointer">
                    Nenhum (Limpar)
                </SelectItem>
                {filtered.map((item: any) => {
                    const name = item.module?.name || item.modules?.name || item.Module?.name || item.name ;
                    const realModuleId = item.moduleId || item.modules?.id || item.module?.id || item.id;
                    return (
                      <SelectItem key={item.id} value={realModuleId} className="cursor-pointer">
                        {name}
                      </SelectItem>
                    )
                })}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
