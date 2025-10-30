import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDepartments, useCreateDepartment } from "@/infrastructure/hooks/useDepartments";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { departmentSchema } from "@/infrastructure/schema/schema-department";
import type { Department } from "@/types/domain";
import { z } from "zod";

type DepartmentForm = z.infer<typeof departmentSchema>;

interface DepartmentSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
}

export function DepartmentSelect({ value, onChange, companyId }: DepartmentSelectProps) {
  const [open, setOpen] = useState(false);
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

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o departamento" />
        </SelectTrigger>
        <SelectContent>
          {departments.map((d: Department) => (
            <SelectItem key={d.id} value={d.id!}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" variant="outline" size="icon" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>Criar Departamento</DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 mt-2">
            <input {...form.register("name")} className="input w-full" placeholder="Nome do departamento" />
            {form.formState.errors.name && <span className="text-red-500 text-xs">{form.formState.errors.name.message}</span>}
            <div className="flex justify-end mt-4">
              <Button type="submit" disabled={createDepartment.status === 'pending'}>
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
