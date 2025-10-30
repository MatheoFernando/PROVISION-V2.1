import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { zoneSchema } from "@/infrastructure/schema/schema-zone";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { useCreateZone, useZones } from "@/infrastructure/hooks/useZones";

type ZoneForm = z.infer<typeof zoneSchema>;

interface ZoneSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
  employeeId: string;
  areaId: string;
}

export function ZoneSelect({ value, onChange, companyId, employeeId, areaId }: ZoneSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: zones = [], isLoading } = useZones();
  const createZone = useCreateZone();
  const form = useForm<ZoneForm>({
    resolver: zodResolver(zoneSchema.pick({ name: true, companyId: true, employeeId: true, areaId: true })),
    defaultValues: { name: "", companyId, employeeId, areaId },
  });
  function handleSubmit(data: ZoneForm) {
    createZone.mutate(data, {
      onSuccess: (created) => {
        setOpen(false);
        onChange(created.id!);
        form.reset({ name: "", companyId, employeeId, areaId });
      },
    });
  }
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione a zona" />
        </SelectTrigger>
        <SelectContent>
          {zones.map((z) => (
            <SelectItem key={z.id} value={z.id!}>
              {z.name}
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
          <DialogHeader>Criar Zona</DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-3 mt-2"
          >
            <Label htmlFor="name-zone">Nome da zona</Label>
            <Input id="name-zone" {...form.register("name")} />
            {form.formState.errors.name && (
              <span className="text-red-500 text-xs">
                {form.formState.errors.name.message as string}
              </span>
            )}
            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                disabled={createZone.status === "pending"}
                className="px-6 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
              >
                {createZone.status === "pending" ? (
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
