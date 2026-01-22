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
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { usePermissions, useCreatePermission } from "@/infrastructure/hooks/usePermissions";
import { createPermissionSchema } from "@/infrastructure/schema/schema-permission";
import type { CreatePermissionForm } from "@/infrastructure/schema/schema-permission";
import type { Permission } from "@/infrastructure/types/domain";
import { Input } from "@/components/ui/input";

interface PermissionSelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function PermissionSelect({ value, onChange }: PermissionSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { companyId } = useAuthStore();
  const { data: permissions = [], isLoading } = usePermissions(companyId ?? undefined);
  const createPermission = useCreatePermission();

  const form = useForm<CreatePermissionForm>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: { name: "", companyId: companyId ?? "" },
  });

  function handleSubmit(data: CreatePermissionForm) {
    if (!companyId) return;
    createPermission.mutate(
      { ...data, companyId, description: data.description ?? "" },
      {
        onSuccess: (created: Permission) => {
          setOpen(false);
          onChange(created.id!);
          form.reset({ name: "", description: "", companyId });
        },
      }
    );
  }

  const list = Array.isArray(permissions) ? permissions : [];
  const filtered = list.filter((p: Permission) => String(p?.name ?? "").toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select value={value} onValueChange={onChange} disabled={isLoading || !companyId}>
          <SelectTrigger className="w-full shadow-sm ">
            <SelectValue placeholder={isLoading ? "Carregando permissões..." : "Selecione permissão"} />
          </SelectTrigger>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-2 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar permissões..."
                className="w-full"
                disabled={isLoading || list.length === 0}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">
                Não há dados disponíveis.</div>
            ) : (
              <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                {filtered.map((p: Permission) => (
                  <SelectItem key={p.id} value={p.id!} className="cursor-pointer">
                    {p.name}
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
        className="text-blue-600 border-blue-200 hover:bg-blue-50 focus-visible:ring-blue-500 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm w-full px-4 py-6 rounded-lg">
          <DialogHeader className="mb-2 text-blue-700 font-semibold text-lg">Criar Permissão</DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-2 w-full"
            autoComplete="off"
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-sm text-blue-900 font-medium mb-2 block">Nome</label>
              <input
                id="name"
                {...form.register("name")}
                className="border border-blue-300 rounded focus:border-blue-500 focus-visible:ring-blue-400 px-2 py-2 text-sm transition w-full"
                placeholder="Nome da permissão"
                autoFocus
              />
              {form.formState.errors.name && (
                <span className="text-red-500 text-xs mt-1">
                  {form.formState.errors.name.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="description" className="text-sm text-blue-900 font-medium block mb-2">Descrição</label>
              <textarea
                id="description"
                {...form.register("description")}
                placeholder="Descrição (opcional)"
                className="border border-blue-300 rounded focus:border-blue-500 focus-visible:ring-blue-400 px-2 py-2 text-sm transition resize-none w-full min-h-[70px]"
                rows={3}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                disabled={createPermission.status === "pending"}
                className="bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500/80 px-6 py-2 rounded transition cursor-pointer"
              >
                {createPermission.status === "pending" ? "A guardar..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PermissionSelect;


