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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { areaSchema } from "@/infrastructure/schema/schema-area";
import { Area } from "@/infrastructure/types/domain";
import { Label } from "@/components/ui/label";
import { EmployeeSelect } from "./employee-select";
import { toast } from "sonner";

type AreaForm = {
  name: string;
  employeeId: string;
  companyId: string;
};

interface AreaSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
  employeeId?: string;
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
    defaultValues: {
      name: "",
      companyId: companyId,
      employeeId: employeeId ?? "",
    },
  });
  function handleSubmit(data: AreaForm) {
    const effectiveEmployeeId = data.employeeId || employeeId || "";
    if (!effectiveEmployeeId) {
      form.setError("employeeId", { message: "Funcionário é obrigatório" });
      return;
    }
   
    createArea.mutate(
      { ...data, employeeId: effectiveEmployeeId },
      {
        onSuccess: (created) => {
          setOpen(false);
          onChange(created.id!);
          form.reset({ name: "", companyId });
        },
      }
    );
  }
  const list = Array.isArray(areas) ? areas : [];
  const filtered = list.filter((a: Area) =>
    String(a?.name ?? "")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

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
            <div className="p-1 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar áreas..."
                className="w-full placeholder:text-xs"
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
                {filtered.map((a: Area) => (
                  <SelectItem key={a.id} value={a.id!}>
                    <span className="truncate">{a.name}</span>
                  </SelectItem>
                ))}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="cursor-pointer shrink-0"
            disabled={createArea.status === "pending"}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[26rem] p-4"
          onInteractOutside={(e) => {
            if (createArea.status === "pending") e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (createArea.status === "pending") e.preventDefault();
          }}
        >
          <div className="font-medium mb-4 text-lg">Criar Área</div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-3 mt-2 "
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name-area">Nome da área</Label>
                <Input
                  id="name-area"
                  {...form.register("name")}
                  placeholder="Nome da área"
                />
                {form.formState.errors.name && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.name.message as string}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label>Funcionário *</Label>
                <EmployeeSelect
                  value={(form.watch("employeeId") as string) || ""}
                  onChange={(v: string) =>
                    form.setValue("employeeId", v, { shouldValidate: true })
                  }
                  companyId={companyId}
                />
                {form.formState.errors.employeeId && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.employeeId.message as string}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                type="button"
                disabled={createArea.status === "pending"}
                className="px-6 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => form.handleSubmit(handleSubmit)()}
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
