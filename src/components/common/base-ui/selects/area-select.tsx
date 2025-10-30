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
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione a área" />
        </SelectTrigger>
        <SelectContent>
          {areas.map((a: Area) => (
            <SelectItem key={a.id} value={a.id!}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="cursor-pointer"
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
