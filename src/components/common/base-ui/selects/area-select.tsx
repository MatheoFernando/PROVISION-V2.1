import { useState } from "react";
import { useAreas, useCreateArea } from "@/infrastructure/hooks/useAreas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { areaSchema } from "@/infrastructure/schema/schema-area";
import { Area } from "@/types/domain";
import { Label } from "@/components/ui/label";

type AreaForm = {
  name: string;
  employeeId: string;
  companyId: string;
};

interface AreaSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
  employeeId: string;
}

export function AreaSelect({
  value,
  onChange,
  companyId,
  employeeId,
}: AreaSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: areas = [], isLoading } = useAreas();
  const createArea = useCreateArea();
  const form = useForm<AreaForm>({
    resolver: zodResolver(
      areaSchema.pick({ name: true, companyId: true, employeeId: true })
    ),
    defaultValues: { name: "", companyId, employeeId },
  });
  function handleSubmit(data: AreaForm) {
    createArea.mutate(data, {
      onSuccess: (created) => {
        setOpen(false);
        onChange(created.id!);
        form.reset({ name: "", companyId, employeeId });
      },
    });
  }
  const list = Array.isArray(areas) ? areas : [];
  const filtered = list.filter((a: Area) => String(a?.name ?? "").toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select value={value} onValueChange={onChange} disabled={isLoading}>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Selecione a área" />
          </SelectTrigger>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-2 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar áreas..."
                className="w-full"
                disabled={isLoading || list.length === 0}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">Não há dados disponíveis.</div>
            ) : (
              <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                {filtered.map((a: Area) => (
                  <SelectItem key={a.id} value={a.id!}>
                    {a.name}
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
        className="cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>Criar Área</DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-3 mt-2"
          >
            <Label htmlFor="name-area">Nome da área</Label>
            <Input id="name-area" {...form.register("name")} />
            {form.formState.errors.name && (
              <span className="text-red-500 text-xs">
                {form.formState.errors.name.message as string}
              </span>
            )}
            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                disabled={createArea.status === "pending"}
                className="px-6 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
              >
                {createArea.status === "pending" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
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
