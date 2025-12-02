import { useState, useEffect, useMemo } from "react";
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

type AreaForm = {
  name: string;
  employeeId?: string;
  companyId: string;
};

interface AreaSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
  employeeId?: string;
}

export function AreaSelect({
  value: valueProp,
  onChange,
  companyId,
  employeeId,
}: AreaSelectProps) {
  const value = valueProp && valueProp.trim() !== '' ? valueProp : undefined;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [createdAreas, setCreatedAreas] = useState<Array<Area & { createdAt?: string }>>([]);
  const { data: areas = [], isLoading, isFetching, refetch } = useAreas();
  const createArea = useCreateArea();

  const form = useForm<AreaForm>({
    resolver: zodResolver(
      areaSchema.pick({ name: true, companyId: true })
    ),
    defaultValues: {
      name: "",
      companyId: companyId,
      employeeId: employeeId,
    },
  });

  useEffect(() => {
    if (value) {
      setSelectedAreaId(value);
    } else {
      setSelectedAreaId(null);
    }
  }, [value]);

  useEffect(() => {
    form.reset({ name: "", companyId, employeeId: employeeId ?? "" });
  }, [companyId, employeeId, form, open]);

  function handleSubmit(data: AreaForm) {
    const effectiveEmployeeId = data.employeeId || employeeId;

    const payload: Omit<Area, "id" | "createdAt" | "updatedAt"> = {
      name: data.name,
      companyId,
      ...(effectiveEmployeeId ? { employeeId: effectiveEmployeeId } : {}),
    };

    createArea.mutate(
      payload,
      {
        onSuccess: (created) => {
          setOpen(false);
          if (created?.id) {
            const areaWithMeta = created as Area & { createdAt?: string };
            const normalizedArea: Area & { createdAt?: string } = {
              ...areaWithMeta,
              id: created.id,
              name: created?.name ?? "",
              createdAt: areaWithMeta.createdAt ?? new Date().toISOString(),
            };

            setCreatedAreas((prev) => {
              if (prev.some((item) => item.id === created.id)) return prev;
              return [normalizedArea, ...prev];
            });

            setTimeout(() => {
              setSelectedAreaId(created.id!);
              onChange(created.id!);
            }, 0);
          }
          form.reset({ name: "", companyId, employeeId });
          void refetch();
        },
      }
    );
  }

  const areasList = useMemo<Area[]>(() => {
    const baseList = Array.isArray(areas) ? areas : [];
    const merged: Array<Area & { createdAt?: string }> = [
      ...createdAreas,
      ...baseList,
    ];
    const map = new Map<string, Area & { createdAt?: string }>();
    merged.forEach((area) => {
      if (!area?.id) return;
      map.set(area.id, {
        ...area,
        id: area.id,
        name: area.name ?? "",
        createdAt:
          (area as Area & { createdAt?: string }).createdAt ??
          new Date().toISOString(),
      });
    });
    return Array.from(map.values()).sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [createdAreas, areas]);

  const filtered = useMemo(
    () =>
      areasList.filter((a: Area) =>
        String(a?.name ?? "")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [areasList, query]
  );

  useEffect(() => {
    if (value && areasList.length > 0) {
      const areaExists = areasList.some(area => area.id === value);
      if (areaExists) {
        setSelectedAreaId(value);
      }
    }
  }, [value, areasList]);

  const isLoadingOptions = isLoading || isFetching;
  const isSaving = createArea.status === "pending";

  const displayValue = useMemo(() => {
    const normalizedValue = value && value.trim() !== '' ? value : undefined;

    if (!normalizedValue) {
      return undefined;
    }

    const exists = areasList.some(area => area.id === normalizedValue);
    return exists ? normalizedValue : undefined;
  }, [value, areasList]);

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select
          value={displayValue}
          onValueChange={(selected) => {
            setSelectedAreaId(selected);
            onChange(selected);
          }}
          disabled={isLoadingOptions}
          onOpenChange={() => refetch()}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a área" />
          </SelectTrigger>
          {isLoadingOptions && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-1 sticky top-0 bg-popover z-10">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar áreas..."
                className="w-full placeholder:text-xs"
                disabled={isLoadingOptions || areasList.length === 0}
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
                  <SelectItem key={a.id} value={a.id!} className="cursor-pointer">
                    <span className="truncate">{a.name}</span>
                  </SelectItem>
                ))}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (isSaving) return;
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="cursor-pointer shrink-0"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[26rem] p-4"
          onInteractOutside={(e) => {
            if (isSaving) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isSaving) e.preventDefault();
          }}
        >
          <div className="font-medium mb-4 text-lg">Criar Área</div>
          <form className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name-area">Nome da área</Label>
                <Input
                  id="name-area"
                  {...form.register("name")}
                  placeholder="Nome da área"
                  disabled={isSaving}
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
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isSaving) return;
                  form.reset({ name: "", companyId, employeeId });
                  setOpen(false);
                }}
                className="cursor-pointer"
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isSaving}
                className="px-6 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => form.handleSubmit(handleSubmit)()}
              >
                {isSaving ? (
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