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
import { Input } from "@/components/ui/input";
import { zoneSchema } from "@/infrastructure/schema/schema-zone";
import { Label } from "@/components/ui/label";
import { useCreateZone, useZones } from "@/infrastructure/hooks/useZones";
import { toast } from "sonner";
import { EmployeeSelect } from "@/components/common/base-ui/selects/employee-select";

const createZoneSchema = zoneSchema.pick({
  name: true,
  companyId: true,
  employeeId: true,
  areaId: true,
});

interface ZoneForm {
  name: string;
  companyId: string;
  employeeId: string;
  areaId: string;
}

interface ZoneSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
  employeeId?: string;
  areaId?: string;
}

export function ZoneSelect({
  value,
  onChange,
  companyId,
  employeeId,
  areaId,
}: ZoneSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: zones = [], isLoading } = useZones();
  const createZone = useCreateZone();
  const form = useForm<ZoneForm>({
    resolver: zodResolver(createZoneSchema),
    defaultValues: { name: "", companyId, employeeId, areaId: areaId ?? "" },
  });
  function handleSubmit(data: ZoneForm) {
    const effectiveEmployeeId = employeeId || data.employeeId;
    if (!effectiveEmployeeId) {
      form.setError("employeeId", { message: "Funcionário é obrigatório" });
      return;
    }

    createZone.mutate(
      { ...data, employeeId: effectiveEmployeeId, areaId: areaId as string },
      {
        onSuccess: (created) => {
          setOpen(false);
          onChange(created.id!);
          form.reset({
            name: "",
            companyId,
            employeeId,
            areaId: areaId as string,
          });
        },
      }
    );
  }
  const list = Array.isArray(zones) ? zones : [];
  const filtered = list.filter((z: any) =>
    String(z?.name ?? "")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select value={value} onValueChange={onChange} disabled={isLoading}>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Selecione a zona" />
          </SelectTrigger>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-2 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar zonas..."
                className="w-full"
                disabled={isLoading || list.length === 0}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">
                Não há dados disponíveis.
              </div>
            ) : (
              <div
                className={
                  filtered.length > 7
                    ? "max-h-60 overflow-y-auto"
                    : "max-h-full"
                }
              >
                {filtered.map((z: any) => (
                  <SelectItem key={z.id} value={z.id!}>
                    {z.name}
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
          if (!areaId) {
            toast.error("Selecione uma área antes de criar uma zona.");
            return;
          }
          form.setValue("areaId", areaId as string, { shouldValidate: true });
          setOpen(true);
        }}
        className="cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>Criar Zona</DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-3 mt-2 "
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Funcionário *</Label>
                <EmployeeSelect
                  value={(form.watch("employeeId") as string) || ""}
                  onChange={(v: string) =>
                    form.setValue("employeeId", v, { shouldValidate: true })
                  }
                  companyId={companyId}
                />
                {(form.formState as any).errors?.employeeId && (
                  <span className="text-red-500 text-xs">
                    {((form.formState as any).errors.employeeId
                      ?.message as string) || "Funcionário é obrigatório"}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name-zone">Nome da zona</Label>
                <Input
                  id="name-zone"
                  {...form.register("name")}
                  placeholder="Nome da zona"
                />
                {form.formState.errors.name && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.name.message as string}
                  </span>
                )}
              </div>
            </div>

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
