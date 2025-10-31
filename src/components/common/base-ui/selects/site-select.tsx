import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSites } from "@/infrastructure/hooks/useSites";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface SiteSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string;
}

export function SiteSelect({ value, onChange }: SiteSelectProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { data: sitesData = [], isLoading } = useSites();

  const sitesList = Array.isArray(sitesData)
    ? sitesData
    : (sitesData as any)?.data ?? (sitesData as any)?.items ?? [];

  const filtered = (Array.isArray(sitesList) ? sitesList : []).filter((s: any) =>
    String(s?.name ?? "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select value={value} onValueChange={onChange} disabled={isLoading}>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Selecione o site" />
          </SelectTrigger>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-2 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar sites..."
                className="w-full"
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">Nenhum dado</div>
            ) : (
              <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                {filtered.map((s: any) => (
                  <SelectItem key={s.id} value={s.id!} className="cursor-pointer">
                    {s.name}
                  </SelectItem>
                ))}
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
        onClick={() => router.push("/dashboard/sites/create")}
        aria-label="Criar site"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}


