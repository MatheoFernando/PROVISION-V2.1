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
import { useTypeOccorrences } from "@/infrastructure/hooks/useTypeOccurrences";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";

interface TypeOccorrenceSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string;
}

export function TypeOccorrenceSelect({ value, onChange, companyId }: TypeOccorrenceSelectProps) {
  const [query, setQuery] = useState("");
  const authCompanyId = useAuthStore((s) => s.companyId);
  const effectiveCompanyId = companyId ?? authCompanyId ?? undefined;
  const { data: list = [], isLoading } = useTypeOccorrences(effectiveCompanyId);

  const filtered = useMemo(
    () => (Array.isArray(list) ? list : []).filter((t: any) =>
      String(t?.description ?? "").toLowerCase().includes(query.toLowerCase()) ||
      String(t?.cod ?? "").toLowerCase().includes(query.toLowerCase())
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
            <SelectValue placeholder={!effectiveCompanyId ? "Selecione uma empresa primeiro" : "Selecione o tipo de ocorrência"} />
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
                  placeholder="Filtrar tipos..."
                  className="w-full placeholder:text-xs"
                  disabled={isLoading || (Array.isArray(list) && list.length === 0)}
                />
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">Não há dados disponíveis.</div>
            ) : (
              <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                {filtered.map((t: any) => (
                  <SelectItem key={t.id} value={t.id} className="cursor-pointer">
                    {t.cod ? `${t.cod}` : t.description}
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

