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
import { Plus } from "lucide-react";
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

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o setor" />
        </SelectTrigger>
        <SelectContent>
          {sectors.map((s) => (
            <SelectItem key={s.id} value={s.id!}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
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
