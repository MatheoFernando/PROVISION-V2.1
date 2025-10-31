import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useCreateSector, useSectors } from "@/infrastructure/hooks/useSectors";
import { Sector } from "@/types/domain";
import { sectorSchema } from "@/infrastructure/schema/schema-sector";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SectorSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
  employeeId: string;
  zoneId: string;
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

  const { data: sectors = [], isLoading } = useSectors();
  const createSector = useCreateSector();
  const form = useForm<Sector>({
    resolver: zodResolver(sectorSchema),
    defaultValues: { name: "", employeeId, zoneId, companyId },
  });

  function handleSubmit(data: Sector) {
    createSector.mutate(data, {
      onSuccess: (created: any) => {
        setOpen(false);
        onChange(created.id);
        form.reset();
      },
    });
  }

  const list = Array.isArray(sectors) ? sectors : [];
  const filtered = list.filter((s: Sector) => String(s?.name ?? "").toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select value={value} onValueChange={onChange} disabled={isLoading}>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Selecione o setor" />
          </SelectTrigger>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-2 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar setores..."
                className="w-full"
                disabled={isLoading || list.length === 0}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">Não há dados disponíveis.</div>
            ) : (
              <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                {filtered.map((s: Sector) => (
                  <SelectItem key={s.id} value={s.id!}>
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
        onClick={() => setOpen(true)}
        className="shrink-0"
      >
        <Plus className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>Criar Setor</DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-3 mt-2"
          >
            <Label>

            </Label>
            <Input
              {...form.register("name")}
              className="input w-full"
              placeholder="Nome do setor"
              
            />
            {form.formState.errors.name && (
              <span className="text-red-500 text-xs">
                {form.formState.errors.name.message}
              </span>
            )}
        
            <div className="col-span-2 flex justify-end mt-4">
              <Button type="submit" className="bg-blue-400">
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
