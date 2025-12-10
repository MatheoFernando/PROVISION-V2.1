import { Loader2 } from "lucide-react";
import type { Site } from "@/infrastructure/types/domain";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSites } from "@/infrastructure/hooks/useSites";
import { Input } from "@/components/ui/input";

interface SiteSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string;
  customerId?: string;
  disabled?: boolean;
}

export function SiteSelect({ value, onChange, customerId, disabled }: SiteSelectProps) {
  const [query, setQuery] = React.useState("");
  const { data: sitesData, isLoading} = useSites(customerId);

  const sitesList = React.useMemo<Site[]>(() => {
    const baseList = (() => {
      if (Array.isArray(sitesData)) return sitesData;
      if (sitesData && typeof sitesData === "object") {
        const fallback = sitesData as Record<string, Site[] | undefined>;
        return (fallback.data ?? fallback.items ?? []) as Site[];
      }
      return [];
    })();
    const merged: Array<Site & { createdAt?: string }> = [
      ...baseList,
    ];
    const map = new Map<string, Site & { createdAt?: string }>();
    merged.forEach((site) => {
      if (!site?.id) return;
      map.set(site.id, {
        ...site,
        id: site.id,
        name: site.name ?? "",
        createdAt:
          (site as Site & { createdAt?: string }).createdAt ??
          new Date().toISOString(),
      });
    });
    return Array.from(map.values()).sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [sitesData]);

  const filtered = React.useMemo(() => {
    const keyword = query.toLowerCase();
    return sitesList.filter((site) =>
      site.name?.toLowerCase().includes(keyword) ||
      site.cod?.toLowerCase().includes(keyword)
    );
  }, [sitesList, query]);



  return (
    <>
      <div className="flex items-stretch gap-2 w-full">
        <div className="flex-1 min-w-0 relative">
          <Select
            value={value ? value : undefined}
            onValueChange={(selected) => onChange(selected)}
            disabled={isLoading || disabled}
          >
            <SelectTrigger className="w-full ">
              <SelectValue placeholder="Selecione o site">
                {filtered.find(s => s.id === value) ? (
                  <span>
                    <span>{filtered.find(s => s.id === value)?.cod || '---'}</span> - {filtered.find(s => s.id === value)?.name}
                  </span>
                ) : (
                  "Selecione o site"
                )}
              </SelectValue>
            </SelectTrigger>
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
            <SelectContent className="w-[var(--radix-select-trigger-width)]">
              <div className="p-2 sticky top-0 bg-popover border-b">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filtrar sites..."
                  className="w-full"
                  disabled={isLoading || sitesList.length === 0}
                />
              </div>

              <div className="pl-2 pr-2 bg-muted/50 border-b sticky top-10 z-10">
                <div className="grid grid-cols-[100px_1fr] w-full">
                  <div className="py-2 text-xs font-semibold border-r border-border/50">Código</div>
                  <div className="py-2 text-xs font-semibold">Nome </div>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 text-center">Nenhum dado</div>
              ) : (
                <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                  {filtered.map((site) => {
                    if (!site?.id) return null;
                    return (
                      <SelectItem
                        key={site.id}
                        value={site.id}
                        textValue={`${site.cod || '---'} - ${site.name}`}
                        className="cursor-pointer border-b last:border-b-0 hover:bg-accent"
                      >
                        <div className="grid grid-cols-[100px_1fr] w-full items-center">
                          <span className="px-2 text-sm border-r border-border/50 ">
                            {site.cod || '---'}
                          </span>
                          <span className="px-2 truncate">
                           {site.name.slice(0, 15)}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

      </div>

    </>
  );
}


