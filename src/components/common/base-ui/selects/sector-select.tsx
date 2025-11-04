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
import { Sector } from "@/infrastructure/types/domain";
import { sectorSchema } from "@/infrastructure/schema/schema-sector";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { EmployeeSelect } from "@/components/common/base-ui/selects/employee-select";

interface SectorSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
  employeeId?: string;
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
    const effectiveEmployeeId = employeeId || data.employeeId;
    if (!effectiveEmployeeId) {
      form.setError("employeeId", { message: "Funcionário é obrigatório" });
      return;
    }
    createSector.mutate({ ...(data as any), employeeId: effectiveEmployeeId, zoneId, companyId } as any, {
      onSuccess: (created: any) => {
        setOpen(false);
        onChange(created.id);
        form.reset({ name: "", employeeId, zoneId, companyId });
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
        onClick={() => {
          if (!zoneId) {
            toast.error("Selecione uma zona antes de criar um setor.");
            return;
          }
          setOpen(true);
        }}
        className="cursor-pointer shrink-0"
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
     
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name-sector">Nome do setor</Label>
                <Input id="name-sector" {...form.register("name")} placeholder="Nome do setor" />
                {form.formState.errors.name && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.name.message as string}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label>Funcionário</Label>
                <EmployeeSelect
                  value={(form.watch("employeeId") as string) || ""}
                  onChange={(v) => form.setValue("employeeId", v, { shouldValidate: true })}
                  companyId={companyId}
                />
                {(form.formState as any).errors?.employeeId && (
                  <span className="text-red-500 text-xs">
                    {((form.formState as any).errors.employeeId?.message as string) || "Funcionário é obrigatório"}
                  </span>
                )}
              </div>
            </div>
        
            <div className="col-span-2 flex justify-end mt-4">
              <Button type="submit" className="px-6 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white">
                {createSector.status === "pending" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
