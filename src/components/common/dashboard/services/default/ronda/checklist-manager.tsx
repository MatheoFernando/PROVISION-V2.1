"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    useCreateItemInspectionRoundMutation,
    useUpdateItemInspectionRoundMutation,
    useDeleteItemInspectionRoundMutation,
} from "@/infrastructure/hooks/useItemInspectionRounds";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { Loader2, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteModal } from "@/components/ui/delete-modal";

const itemSchema = z.object({
    category: z.string().min(1, "Categoria é obrigatória"),
    description: z.string().min(1, "Descrição é obrigatória"),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ChecklistManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialItemToEdit?: any;
    defaultOpenForm?: boolean;
}

export function ChecklistManager({ open, onOpenChange, initialItemToEdit, defaultOpenForm = false }: ChecklistManagerProps) {
    const companyId = useAuthStore((state) => state.companyId || "");
    const { mutate: createItem, isPending: isCreating } = useCreateItemInspectionRoundMutation();
    const { mutate: updateItem, isPending: isUpdating } = useUpdateItemInspectionRoundMutation();
    const { mutate: deleteItem, isPending: isDeleting } = useDeleteItemInspectionRoundMutation();

    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const form = useForm<ItemFormValues>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            category: "",
            description: "",
        },
    });



    useEffect(() => {
        if (open) {
            if (initialItemToEdit) {
                setEditingItem(initialItemToEdit);
                setIsAddingNew(true);
                form.reset({
                    category: initialItemToEdit.category,
                    description: initialItemToEdit.description,
                });
            } else if (defaultOpenForm) {
                setIsAddingNew(true);
                setEditingItem(null);
                form.reset({
                    category: "",
                    description: "",
                });
            } else {
                setIsAddingNew(false);
                setEditingItem(null);
                form.reset({ category: "", description: "" });
            }
        } else {

            setIsAddingNew(false);
            setEditingItem(null);
        }
    }, [open, initialItemToEdit, defaultOpenForm, form]);

    const isEditMode = !!editingItem;
    const isPending = isCreating || isUpdating;

    const handleCreate = (data: ItemFormValues) => {
        if (!companyId) {
            toast.error("Empresa não identificada");
            return;
        }

        const successCallback = async () => {
            await refetch();
            form.reset();
            setIsAddingNew(false);
            setEditingItem(null);
        };

        if (isEditMode && editingItem?.id) {
            updateItem({
                ...editingItem,
                category: data.category,
                description: data.description
            }, { onSuccess: successCallback });
        } else {
            createItem({
                category: data.category,
                description: data.description,
                companyId
            }, { onSuccess: successCallback });
        }
    };



    const handleDelete = () => {
        if (itemToDelete) {
            deleteItem(itemToDelete, {
                onSuccess: async () => {
                    await refetch();
                    setItemToDelete(null);
                },
            });
        }
    };



    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-xl max-h-[60vh] p-0 overflow-hidden bg-white dark:bg-slate-950 shadow-xl border-none flex flex-col rounded-xl">
                    <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-slate-900/50 bg-white dark:bg-slate-950">
                        <div className="flex justify-between items-center">
                            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                                {isAddingNew && (
                                    <>
                                        {isEditMode ? <Pencil className="h-5 w-5 text-slate-500" /> : <Plus className="h-5 w-5 text-slate-500" />}
                                        {isEditMode ? "Editar Item" : "Novo Item"}
                                    </>
                                )}
                            </DialogTitle>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/50 dark:bg-slate-900/20">
                        <ScrollArea className="h-full px-4 py-4">
                            <div className="space-y-4 pb-20">

                                <div className="px-2 animate-in fade-in-50 slide-in-from-top-1">
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="category" className="text-xs font-medium text-slate-500">
                                                Categoria
                                            </Label>
                                            <Input
                                                id="category"
                                                placeholder="Ex: Segurança"
                                                className="h-9"
                                                {...form.register("category")}
                                            />
                                            {form.formState.errors.category && (
                                                <p className="text-xs text-red-500">
                                                    {form.formState.errors.category.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="description" className="text-xs font-medium text-slate-500">
                                                Descrição
                                            </Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Descrição do item..."
                                                className="resize-none min-h-[80px] text-sm"
                                                {...form.register("description")}
                                            />
                                            {form.formState.errors.description && (
                                                <p className="text-xs text-red-500">
                                                    {form.formState.errors.description.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>


                                </div>

                            </div>
                        </ScrollArea>
                    </div>

                    <div className="px-4 py-3  gap-4 border-t border-gray-100 dark:border-slate-900/50 bg-white dark:bg-slate-950 flex justify-end">
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            variant="secondary"
                            className="bg-gray-100 hover:bg-gray-200 text-slate-900 h-9"
                        >
                            Fechar
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={form.handleSubmit(handleCreate)}
                            disabled={isPending}
                            className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-4"
                        >
                            {isPending ? (
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            ) : null}
                            {isEditMode ? "Atualizar" : "Guardar"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <DeleteModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}
