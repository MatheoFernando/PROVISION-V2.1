"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useContainers } from "@/infrastructure/hooks/useContainers";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import type { Container } from "@/infrastructure/types/domain";

interface ContainerSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string;
}

export function ContainerSelect({ value, onChange, companyId }: ContainerSelectProps) {
  const [query, setQuery] = useState("");
  const authCompanyId = useAuthStore((s) => s.companyId);
  const effectiveCompanyId = companyId ?? authCompanyId ?? undefined;
  const { data: list = [], isLoading } = useContainers(effectiveCompanyId);


  const filtered = useMemo(
    () => (Array.isArray(list) ? list : []).filter((c: Container) =>
      String(c?.name ?? "").toLowerCase().includes(query.toLowerCase()) ||
      String(c?.cod ?? "").toLowerCase().includes(query.toLowerCase())
    ),
    [list, query]
  );

  const normalizedValue = value;

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select
          value={normalizedValue || undefined}
          onValueChange={(selected) => onChange(selected)}
          disabled={isLoading || !effectiveCompanyId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={!effectiveCompanyId ? "Selecione uma empresa primeiro" : "Selecione o contentor"} />
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
          </SelectTrigger>
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-1 sticky top-0 bg-popover">
              <div className="flex items-center gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrar contentores..."
                  className="w-full placeholder:text-xs"
                  disabled={isLoading || (Array.isArray(list) && list.length === 0)}
                />
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">Não há dados disponíveis.</div>
            ) : (
              <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                {filtered.map((c: Container) => (
                  <SelectItem key={c.id} value={c.id!} className="cursor-pointer">
                    {c.cod ? `${c.cod} - ${c.name}` : c.name}
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
