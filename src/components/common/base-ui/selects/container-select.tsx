import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useContainers } from "@/infrastructure/hooks/useContainers";
import { useQueryClient } from "@tanstack/react-query";

interface ContainerSelectProps {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  onCreateClick?: () => void;
}

export function ContainerSelect({ value, onChange, required = false }: ContainerSelectProps) {
  const { data: containers = [], isLoading } = useContainers();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    const arr = Array.isArray(containers)
      ? containers
      : (containers as any)?.items ?? (containers as any)?.data ?? [];
    return arr as Array<{ id: string; cod?: string; name?: string }>
  }, [containers]);

  const filtered = search
    ? list.filter((c) => `${c.cod ?? ""} ${c.name ?? ""}`.toLowerCase().includes(search.toLowerCase()))
    : list;

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 mb-2">
        <div className="flex-1 relative min-w-0">
          <Select value={value} onValueChange={onChange} disabled={isLoading} required={required}>
            <SelectTrigger className="w-full ">
              <SelectValue placeholder="Selecione o container" />
            </SelectTrigger>
            {isLoading && (
              <Loader2 className="animate-spin w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
            )}
            <SelectContent>
              <div className="px-3 pt-2 pb-1 border-b bg-background sticky top-0 z-10 space-y-2">
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Pesquisar container..."
                  className="h-8 text-sm placeholder:font-normal"
                  disabled={isLoading || list.length === 0}
                  autoFocus
                />
              </div>
              {filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 text-center">Não há dados disponíveis.</div>
              ) : (
                <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                  {filtered.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.cod ? `${c.cod}${c.name ? ` - ${c.name}` : ""}` : (c.name ?? c.id)}
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
          className="flex items-center gap-2 px-3 py-2 rounded-md shrink-0 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4" />
      
        </Button>
      </div>

   
    </div>
  );
}


