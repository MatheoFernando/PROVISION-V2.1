import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRolesAll, useCreateRole } from "@/infrastructure/hooks/useRoles";
import { createRoleSchema } from "@/infrastructure/schema/schema-role";
import type { Role } from "@/infrastructure/types/domain";
import { z } from "zod";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";

type RoleForm = z.infer<typeof createRoleSchema>;

interface RoleSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string | null;
  departmentId?: string | null;
  disabled?: boolean;
}

export function RoleSelect({ value: valueProp, onChange, companyId, departmentId, disabled }: RoleSelectProps) {
  const value = valueProp && valueProp.trim() !== '' ? valueProp : undefined;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [createdRoles, setCreatedRoles] = useState<Array<Role & { createdAt?: string }>>([]);

  const { companyId: storeCompanyId } = useAuthStore();
  const normalizedCompanyId = companyId ?? storeCompanyId ?? "";

  const { data: roles = [], isLoading, isFetching, refetch } = useRolesAll(normalizedCompanyId);
  const createRole = useCreateRole();
  const form = useForm<RoleForm>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: "", description: "", companyId: normalizedCompanyId },
  });

  useEffect(() => {
    if (value) {
      setSelectedRoleId(value);
    } else {
      setSelectedRoleId(null);
    }
  }, [value]);

  useEffect(() => {
    form.reset({ name: "", description: "", companyId: normalizedCompanyId, departmentId: departmentId ?? undefined });
  }, [normalizedCompanyId, departmentId, form, open]);

  function handleSubmit(data: RoleForm) {
    if (!normalizedCompanyId) return;

    createRole.mutate(
      {
        ...data,
        companyId: normalizedCompanyId,
        departmentId: departmentId ?? undefined,
        description: data.description ?? "",
      },
      {
        onSuccess: (created: Role) => {
          setOpen(false);
          if (created?.id) {
            const roleWithMeta = created as Role & { createdAt?: string };
            const normalizedRole: Role & { createdAt?: string } = {
              ...roleWithMeta,
              id: created.id,
              name: created?.name ?? "",
              createdAt: roleWithMeta.createdAt ?? new Date().toISOString(),
            };

            setCreatedRoles((prev) => {
              if (prev.some((item) => item.id === created.id)) return prev;
              return [normalizedRole, ...prev];
            });

            // Auto-seleciona o novo item criado
            setTimeout(() => {
              setSelectedRoleId(created.id!);
              onChange(created.id!);
            }, 0);
          }
          form.reset({
            name: "",
            description: "",
            companyId: normalizedCompanyId,
          });
          void refetch();
        },
      }
    );
  }

  const rolesList = useMemo<Role[]>(() => {
    const baseList = Array.isArray(roles) ? roles : [];
    const merged: Array<Role & { createdAt?: string }> = [
      ...createdRoles,
      ...baseList,
    ];
    const map = new Map<string, Role & { createdAt?: string }>();
    merged.forEach((role) => {
      if (!role?.id) return;
      map.set(role.id, {
        ...role,
        id: role.id,
        name: role.name ?? "",
        createdAt:
          (role as Role & { createdAt?: string }).createdAt ??
          new Date().toISOString(),
      });
    });
    return Array.from(map.values()).sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [createdRoles, roles]);

  const filtered = useMemo(
    () =>
      rolesList.filter((role: Role) =>
        String(role?.name ?? "")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [rolesList, query]
  );

  // Garante que o valor selecionado seja atualizado quando a lista carregar
  useEffect(() => {
    if (value && rolesList.length > 0) {
      const exists = rolesList.some(item => item.id === value);
      if (exists) {
        setSelectedRoleId(value);
      }
    }
  }, [value, rolesList, selectedRoleId]);

  const isCreating = createRole.status === "pending";
  const isLoadingOptions = isLoading || isFetching;

  // Valor a ser exibido no Select
  const displayValue = useMemo(() => {
    const normalizedValue = value && value.trim() !== '' ? value : undefined;
    if (!normalizedValue) return undefined;
    const exists = rolesList.some(item => item.id === normalizedValue);
    return exists ? normalizedValue : undefined;
  }, [value, rolesList, selectedRoleId]);

  return (
    <div className="flex items-end gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select
          value={displayValue}
          onValueChange={(selected) => {
            setSelectedRoleId(selected);
            onChange(selected);
          }}
          disabled={disabled || isLoadingOptions}
          onOpenChange={() => refetch()}
        >
          <SelectTrigger className="w-full shadow-sm">
            <SelectValue
              placeholder={
                isLoadingOptions
                  ? "A carregar papéis..."
                  : "Selecione o papel"
              }
            />
          </SelectTrigger>
          {isLoadingOptions && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-2 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filtrar papéis..."
                className="w-full placeholder:text-xs"
                disabled={isLoadingOptions || rolesList.length === 0}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">
                {isLoadingOptions
                  ? "A carregar..."
                  : "Nenhum papel encontrado."}
              </div>
            ) : (
              <div
                className={
                  filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"
                }
              >
                {filtered.map((role: Role) => (
                  <SelectItem key={role.id} value={role.id!}>
                    {role.name}
                  </SelectItem>
                ))}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (isCreating) return;
          if (nextOpen && !departmentId) {
             toast.error("Por favor, selecione um departamento antes de criar uma função.");
             return;
          }
          setOpen(nextOpen);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 cursor-pointer"
            disabled={isCreating}
          >
            {isCreating ? (
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
          onInteractOutside={(event) => {
            if (isCreating) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (isCreating) event.preventDefault();
          }}
        >
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="role-name">Nome do papel</Label>
              <Input
                id="role-name"
                {...form.register("name")}
                placeholder="Nome"
                disabled={isCreating}
              />
              {form.formState.errors.name && (
                <span className="text-xs text-red-500">
                  {form.formState.errors.name.message}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Descrição</Label>
              <Textarea
                id="role-description"
                {...form.register("description")}
                placeholder="Descrição opcional"
                disabled={isCreating}
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={isCreating}
                onClick={() => {
                  form.reset({
                    name: "",
                    description: "",
                    companyId: normalizedCompanyId,
                  });
                  setOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isCreating}
                onClick={() => form.handleSubmit(handleSubmit)()}
              >
                {isCreating ? (
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
    </div>
  );
}
