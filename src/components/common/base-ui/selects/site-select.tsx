"use client";

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
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Loader2, Plus, X } from "lucide-react";
import type { Site } from "@/infrastructure/types/domain";
import SitesCreatePage from "@/components/common/dashboard/sites/site-create";

interface SiteSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string;
  customerId?: string;
}

export function SiteSelect({ value, onChange, customerId }: SiteSelectProps) {
  const [query, setQuery] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createdSites, setCreatedSites] = React.useState<
    Array<Site & { createdAt?: string }>
  >([]);
  const { data: sitesData, isLoading, refetch } = useSites(customerId);

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
      ...createdSites,
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
  }, [createdSites, sitesData]);

  const filtered = React.useMemo(() => {
    const keyword = query.toLowerCase();
    return sitesList.filter((site) => site.name?.toLowerCase().includes(keyword));
  }, [sitesList, query]);

  const handleCloseDrawer = () => {
    setIsCreateOpen(false);
  };

  const handleCreateSuccess = (site?: Site) => {
    handleCloseDrawer();
    if (site?.id) {
      const siteWithMeta = site as Site & { createdAt?: string };
      const normalizedSite: Site & { createdAt?: string } = {
        ...siteWithMeta,
        id: site.id,
        name: site?.name ?? "",
        createdAt: siteWithMeta.createdAt ?? new Date().toISOString(),
      };
      setCreatedSites((prev) => {
        if (prev.some((item) => item.id === site.id)) return prev;
        return [normalizedSite, ...prev];
      });
      onChange(site.id);
      void refetch();
    } else {
      void refetch();
    }
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
            <SelectValue placeholder="Selecione o site" />
          </SelectTrigger>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-2 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filtrar sites..."
                className="w-full"
                disabled={isLoading || sitesList.length === 0}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">Nenhum dado</div>
            ) : (
              <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                {filtered.map((site) => {
                  if (!site?.id) return null;
                  return (
                    <SelectItem key={site.id} value={site.id} className="cursor-pointer">
                      {site.name}
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
        aria-label="Criar site"
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
                  <DrawerTitle className="text-2xl font-bold text-foreground">Novo site</DrawerTitle>
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <SitesCreatePage onSuccess={handleCreateSuccess} onCancel={handleCloseDrawer} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}


