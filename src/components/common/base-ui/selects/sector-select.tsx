import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { EmployeeSelect } from "@/components/common/base-ui/selects/employee-select";
import { normalizeId } from "@/lib/normalize-id";

interface SectorSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
  employeeId?: string;
  zoneId?: string;
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
  const [createdSectors, setCreatedSectors] = useState<Sector[]>([]);

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
    if (!zoneId) {
      return;
    }

    createSector.mutate(
      {
        ...data,
        employeeId: effectiveEmployeeId,
        zoneId,
        companyId,
      },
      {
        onSuccess: (created: Sector) => {
          setOpen(false);
          if (created?.id) {
            const normalizedId = normalizeId(created.id);
            onChange(normalizedId);
            setCreatedSectors((prev) => {
              if (prev.some((sector) => sector.id === normalizedId)) return prev;
              return [{ ...created, id: normalizedId }, ...prev];
            });
          }
          form.reset({
            name: "",
            employeeId,
            zoneId: zoneId ?? "",
            companyId,
          });
        },
      }
    );
  }

  const hasZone = Boolean(zoneId);
  const normalizedValue = normalizeId(value);
  const list = useMemo(() => {
    const merged = [...createdSectors, ...(Array.isArray(sectors) ? sectors : [])];
    const map = new Map<string, Sector>();
    merged.forEach((sector) => {
      if (sector?.id) map.set(sector.id, sector);
    });
    return Array.from(map.values()).filter(
      (sector): sector is Sector =>
        Boolean(sector?.id) && sector.companyId === companyId
    );
  }, [companyId, createdSectors, sectors]);
  const filtered = useMemo(
    () =>
      !hasZone
        ? []
        : list.filter(
            (sector) =>
              sector.zoneId === zoneId &&
              String(sector.name ?? "")
                .toLowerCase()
                .includes(query.toLowerCase())
          ),
    [hasZone, list, query, zoneId]
  );

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select
          value={normalizedValue || undefined}
          onValueChange={(selected) => onChange(normalizeId(selected))}
          disabled={isLoading || !hasZone}
        >
          <SelectTrigger className="w-full ">
            <SelectValue
              placeholder={
                hasZone ? "Selecione o setor" : "Selecione uma zona primeiro"
              }
            />
          </SelectTrigger>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-1 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar setores..."
                className="w-full placeholder:text-xs"
                disabled={isLoading || !hasZone || list.length === 0}
              />
            </div>
            {!hasZone ? (
              <div className="text-sm text-muted-foreground p-3 text-center">
                Selecione uma zona para visualizar setores.
              </div>
            ) : filtered.length === 0 ? (
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
                {filtered.map((s) => (
                  <SelectItem key={s.id} value={normalizeId(s.id)}>
                    {s.name}
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
            disabled={createSector.status === "pending" || !hasZone}
            onClick={() => {
              if (!zoneId) return;
              form.setValue("zoneId", zoneId, { shouldValidate: true });
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[26rem] p-4"
          onInteractOutside={(e) => {
            if (createSector.status === "pending") e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (createSector.status === "pending") e.preventDefault();
          }}
        >
          <div className="font-medium mb-4 text-lg">Criar Setor</div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-3 mt-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name-sector">Nome do setor</Label>
                <Input
                  id="name-sector"
                  {...form.register("name")}
                  placeholder="Nome do setor"
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
                  onChange={(v) =>
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

            <div className="col-span-2 flex justify-end mt-4">
              <Button
                type="button"
                className="px-6 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                disabled={createSector.status === "pending" || !hasZone}
                onClick={() => {
                  if (!zoneId) return;
                  form.setValue("zoneId", zoneId, { shouldValidate: true });
                  form.handleSubmit(handleSubmit)();
                }}
              >
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
