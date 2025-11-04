import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useDepartments,
  useCreateDepartment,
} from "@/infrastructure/hooks/useDepartments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { departmentSchema } from "@/infrastructure/schema/schema-department";
import type { Department } from "@/infrastructure/types/domain";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DepartmentForm = z.infer<typeof departmentSchema>;

interface DepartmentSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
}

export function DepartmentSelect({
  value,
  onChange,
  companyId,
}: DepartmentSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: departments = [], isLoading } = useDepartments();
  const createDepartment = useCreateDepartment();
  const form = useForm<DepartmentForm>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", companyId },
  });

  function handleSubmit(data: DepartmentForm) {
    createDepartment.mutate(data, {
      onSuccess: (created: Department) => {
        setOpen(false);
        onChange(created.id!);
        form.reset();
      },
    });
  }

  const filtered = (Array.isArray(departments) ? departments : []).filter((d: Department) =>
    String(d?.name ?? "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select value={value} onValueChange={onChange} disabled={isLoading}>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Selecione o departamento" />
          </SelectTrigger>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-2 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar departamentos..."
                className="w-full"
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">Não há dados disponíveis.</div>
            ) : (
              <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                {filtered.map((d: Department) => (
                  <SelectItem key={d.id} value={d.id!} className="cursor-pointer">
                    {d.name}
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
          <DialogHeader>Criar Departamento</DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-3 mt-2"
          >
            <Label htmlFor="name" className="block mb-2">Nome do departamento</Label>
            <Input
              id="name"
              {...form.register("name")}
              className="w-full"
              placeholder="Nome do departamento"

            />
            {form.formState.errors.name && (
              <span className="text-red-500 text-xs">
                {form.formState.errors.name.message}
              </span>
            )}
            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                disabled={createDepartment.status === "pending"}
                className="px-6 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
              >
                {createDepartment.status === "pending" ? (
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
