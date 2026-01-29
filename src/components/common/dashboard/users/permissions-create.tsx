import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useCreatePermission } from "@/infrastructure/hooks/usePermissions";
import { createPermissionSchema } from "@/infrastructure/schema/schema-permission";
import type { CreatePermissionForm } from "@/infrastructure/schema/schema-permission";
import { useQueryClient } from "@tanstack/react-query";

interface PermissionCreateProps {
    onSuccess?: () => void
}

export function PermissionCreate({ onSuccess }: PermissionCreateProps) {
    const [open, setOpen] = useState(false);
    const { companyId } = useAuthStore();
    const createPermission = useCreatePermission();
    const queryClient = useQueryClient();

    const form = useForm<CreatePermissionForm>({
        resolver: zodResolver(createPermissionSchema),
        defaultValues: { name: "", description: "", companyId: companyId ?? "" },
    });

    function handleSubmit(data: CreatePermissionForm) {
        if (!companyId) return;
        createPermission.mutate(
            { ...data, code: data.name, companyId, description: data.description ?? "" },
            {
                onSuccess: () => {
                    setOpen(false);
                    form.reset({ name: "", description: "", companyId });
                    queryClient.invalidateQueries({ queryKey: ['permissions'] })
                    if (onSuccess) onSuccess()
                },
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm" className="gap-2 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Nova Permissão
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm w-full px-4 py-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 shadow-xl">
                 <DialogHeader className="mb-2">
                    <DialogTitle className=" font-semibold text-lg">Criar Permissão</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4 w-full"
                    autoComplete="off"
                >
                    <div className="flex flex-col gap-1">
                        <label htmlFor="name" className="text-sm font-medium mb-1 block">Nome</label>
                        <input
                            id="name"
                            {...form.register("name")}
                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Nome da permissão"
                        />
                        {form.formState.errors.name && (
                            <span className="text-red-500 text-xs mt-1">
                                {form.formState.errors.name.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="description" className="text-sm font-medium block mb-1">Descrição</label>
                        <textarea
                            id="description"
                            {...form.register("description")}
                            placeholder="Descrição (opcional)"
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button
                            type="submit"
                            disabled={createPermission.status === "pending"}
                            className="bg-blue-600 rounded text-white hover:bg-blue-700 w-full"
                        >
                            {createPermission.status === "pending" ? "A guardar..." : "Salvar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
