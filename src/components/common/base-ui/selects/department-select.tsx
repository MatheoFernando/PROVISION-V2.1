import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  useDepartmentsByCompanyId,
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

const STANDARD_DEPARTMENTS = [
    { code: "DG", name: "Direcção Geral" },
    { code: "DO", name: "Deptº Operações" },
    { code: "DRH", name: "Deptº Recursos Humanos" },
    { code: "DAF", name: "Deptº Admin. e Finanças" },
    { code: "DC", name: "Deptº Comercial" },
    { code: "QHSA", name: "Deptº QHSA (Qualidade, Saúde, Segurança e Ambiente)" },
    { code: "MAN", name: "Deptº Manutenção" },
    { code: "DL", name: "Deptº Logística" },
    { code: "APP", name: "Aplicativo" },
  ] as const;

interface DepartmentSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string | null;
  allowCreate?: boolean;
}

export function DepartmentSelect({
  value: valueProp,
  onChange,
  companyId,
  allowCreate = false,
}: DepartmentSelectProps) {
  const value = valueProp && valueProp.trim() !== '' ? valueProp : undefined;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [createdDepartments, setCreatedDepartments] = useState<
    Array<Department & { createdAt?: string }>
  >([]);
  const normalizedCompanyId = companyId ?? "";
  const { data: departments = [], isLoading, isFetching } = useDepartmentsByCompanyId(normalizedCompanyId);
  const createDepartment = useCreateDepartment();
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

    const payload = {
        ...data,
        cod: data.cod || data.name.substring(0, 3).toUpperCase(),
        companyId: normalizedCompanyId
    };

    createDepartment.mutate(
      payload,
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

            // Trigger change
            setTimeout(() => {
              setSelectedDepartmentId(created.id!);
              onChange(created.id!);
            }, 0);
          }
          form.reset({ name: "", companyId: normalizedCompanyId });
        },
      }
    );
  }

  const departmentsList = useMemo(() => {
    const baseList = Array.isArray(departments) ? departments : [];
    
    // Merge created ones
    const mergedWithCreated = [
      ...createdDepartments,
      ...baseList,
    ];
    
 
    const map = new Map<string, Department & { createdAt?: string }>();
    mergedWithCreated.forEach((dept) => {
        if (!dept?.id) return;
        map.set(dept.id, {
            ...dept,
            id: dept.id,
            name: dept.name ?? "",
            createdAt: (dept as any).createdAt ?? new Date().toISOString(),
        });
    });
  const existingNames = Array.from(map.values()).map(d => d.name.toLowerCase().trim());
    
    const standardToAdd = STANDARD_DEPARTMENTS.filter(std => !existingNames.includes(std.name.toLowerCase().trim()));
    

    const finalStandard = standardToAdd.map(std => ({
        id: `STANDARD:${std.code}`, // Temporary ID
        name: std.name,
        companyId: normalizedCompanyId,
        createdAt: new Date().toISOString()
    } as Department));

    return [...Array.from(map.values()), ...finalStandard].sort((a, b) => {
         return a.name.localeCompare(b.name);
    });
  }, [createdDepartments, departments, normalizedCompanyId]);

  const filtered = useMemo(
    () =>
      departmentsList.filter((department) =>
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

  const handleValueChange = (val: string) => {
      if (val.startsWith('STANDARD:')) {
          // It's a standard one, check if exists (double check) and create
          const code = val.split(':')[1];
          const standard = STANDARD_DEPARTMENTS.find(s => s.code === code);
          if (standard) {
             // Create it
             if (isCompanyUnavailable) {
                 // Should not happen as select is disabled if no company?
                 // Wait, select is disabled if isLoadingOptions, but might be enabled if standard depts are there
               return; 
             }
             
             // Check if already exists in REAL list (race condition?)
             const realExists = departments.find(d => d.name === standard.name);
             if (realExists && realExists.id) {
                 onChange(realExists.id);
                 return;
             }

             // Create
             createDepartment.mutate({
                 name: standard.name,
                 cod: standard.code,
                 companyId: normalizedCompanyId
             } as any, { // Cast as any if type mismatch persists temporarily, but domain update should fix it
                 onSuccess: (created) => {
                     setCreatedDepartments(prev => [...prev, created]);
                     onChange(created.id!);
                 }
             })
          }
      } else {
          setSelectedDepartmentId(val);
          onChange(val);
      }
  }

  const isSaving = createDepartment.status === "pending";
  const isLoadingOptions = isLoading || isFetching;

  // Adjusted displayValue to handle STANDARD IDs if persisted locally for visual feedback before creation?
  // Only real IDs should be passed up. The standard selection triggers creation -> real ID passed up.
  // So displayValue should match valueProp which should contain a REAL ID.
  // Standard items in list are transient. 
  
  const displayValue = useMemo(() => {
    if (!value) return undefined;
    const found = departmentsList.find(d => d.id === value);
    return found ? value : undefined;
  }, [value, departmentsList]);


  return (
    <div className={`flex items-end gap-2 w-full ${!allowCreate ? "flex-col" : ""}`}>
      <div className="flex-1 min-w-0 relative w-full">
        <Select
          value={displayValue}
          onValueChange={handleValueChange}
          disabled={isLoadingOptions && departmentsList.length === 0} // Allow if standard list is available?
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o departamento" />
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
      {allowCreate && (
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
              <Label htmlFor="name" className="block text-sm font-medium">
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

              <Label htmlFor="cod" className="block text-sm font-medium">
                 Código (Opcional)
              </Label>
              <Input
                id="cod"
                {...form.register("cod")}
                className="w-full"
                placeholder="Ex: RH"
                maxLength={10}
                disabled={isSaving}
              />
              {form.formState.errors.cod && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.cod.message}
                </span>
              )}
              <p className="text-[10px] text-gray-400">
                  Se vazio, será gerado automaticamente (ex: DRE).
              </p>

              <div className="flex justify-end gap-2 pt-2">
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
                      <Loader2 className="w-4 h-4 animate-spin" /> A guardar...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
