import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  companyId?: string | null;
}

export function DepartmentSelect({
  value: valueProp,
  onChange,
  companyId,
}: DepartmentSelectProps) {
  const value = valueProp && valueProp.trim() !== '' ? valueProp : undefined;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [createdDepartments, setCreatedDepartments] = useState<
    Array<Department & { createdAt?: string }>
  >([]);
  const { data: departments = [], isLoading, isFetching, refetch } = useDepartments();
  const createDepartment = useCreateDepartment();
  const normalizedCompanyId = companyId ?? "";
  const isCompanyUnavailable = !normalizedCompanyId;
  const form = useForm<DepartmentForm>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", companyId: normalizedCompanyId },
  });

  useEffect(() => {
    if (value) {
      setSelectedDepartmentId(value);
    } else {
      setSelectedDepartmentId(null);
    }
  }, [value]);

  useEffect(() => {
    form.reset({ name: "", companyId: normalizedCompanyId });
  }, [normalizedCompanyId, form, open]);

  function handleSubmit(data: DepartmentForm) {
    if (isCompanyUnavailable) return;

    createDepartment.mutate(
      { ...data, companyId: normalizedCompanyId },
      {
        onSuccess: (created: Department) => {
          setOpen(false);
          if (created?.id) {
            const departmentWithMeta = created as Department & { createdAt?: string };
            const normalizedDepartment: Department & { createdAt?: string } = {
              ...departmentWithMeta,
              id: created.id,
              name: created?.name ?? "",
              createdAt: departmentWithMeta.createdAt ?? new Date().toISOString(),
            };

            setCreatedDepartments((prev) => {
              if (prev.some((item) => item.id === created.id)) return prev;
              return [normalizedDepartment, ...prev];
            });

            setTimeout(() => {
              setSelectedDepartmentId(created.id!);
              onChange(created.id!);
            }, 0);
          }
          form.reset({ name: "", companyId: normalizedCompanyId });
          void refetch();
        },
      }
    );
  }

  const departmentsList = useMemo<Department[]>(() => {
    const baseList = Array.isArray(departments) ? departments : [];
    const merged: Array<Department & { createdAt?: string }> = [
      ...createdDepartments,
      ...baseList,
    ];
    const map = new Map<string, Department & { createdAt?: string }>();
    merged.forEach((dept) => {
      if (!dept?.id) return;
      map.set(dept.id, {
        ...dept,
        id: dept.id,
        name: dept.name ?? "",
        createdAt:
          (dept as Department & { createdAt?: string }).createdAt ??
          new Date().toISOString(),
      });
    });
    return Array.from(map.values()).sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [createdDepartments, departments]);

  const filtered = useMemo(
    () =>
      departmentsList.filter((department: Department) =>
        String(department?.name ?? "")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [departmentsList, query]
  );

  useEffect(() => {
    if (value && departmentsList.length > 0) {
      const departmentExists = departmentsList.some(dept => dept.id === value);
      if (departmentExists) {
        setSelectedDepartmentId(value);
      }
    }
  }, [value, departmentsList, selectedDepartmentId]);

  const isSaving = createDepartment.status === "pending";
  const isLoadingOptions = isLoading || isFetching;

  const displayValue = useMemo(() => {
    const normalizedValue = value && value.trim() !== '' ? value : undefined;

    if (!normalizedValue) {
      return undefined;
    }

    const exists = departmentsList.some(dept => dept.id === normalizedValue);
    return exists ? normalizedValue : undefined;
  }, [value, departmentsList, selectedDepartmentId]);

  return (
    <div className="flex items-end gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select
          value={displayValue}
          onValueChange={(selected) => {
            setSelectedDepartmentId(selected);
            onChange(selected);
          }}
          disabled={isLoadingOptions}
          onOpenChange={() => refetch()}
        >
          <SelectTrigger className="w-full " >
            <SelectValue
              placeholder="Selecione o departamento"
            />
          </SelectTrigger>
          {isLoadingOptions && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-1 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar departamentos..."
                className="w-full placeholder:text-xs"
                disabled={isLoadingOptions || departmentsList.length === 0}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">
                Não há dados disponíveis.
              </div>
            ) : (
              <div
                className={
                  filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"
                }
              >
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
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (isSaving || isCompanyUnavailable) return;
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="cursor-pointer shrink-0"
            disabled={isSaving || isCompanyUnavailable}
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
          className="w-80 p-4"
          onInteractOutside={(e) => {
            if (isSaving) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isSaving) e.preventDefault();
          }}
        >
          <div className="space-y-3">
            <Label htmlFor="name" className="block">
              Nome do departamento
            </Label>
            <Input
              id="name"
              {...form.register("name")}
              className="w-full"
              placeholder="Nome do departamento"
              disabled={isSaving}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
            />
            {form.formState.errors.name && (
              <span className="text-red-500 text-xs">
                {form.formState.errors.name.message}
              </span>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isSaving) return;
                  form.reset({ name: "", companyId: normalizedCompanyId });
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
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
