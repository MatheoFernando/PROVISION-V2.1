"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateTypeEquipment, useUpdateTypeEquipment } from "@/infrastructure/hooks/useTypeEquipment";
import { toast } from "sonner";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { TypeEquipment } from "@/infrastructure/types/domain";
import { createTypeEquipmentSchema } from "@/infrastructure/schema/schema-type-equipment";
import { Loader2 } from "lucide-react";
import { z } from "zod";

interface TypeEquipmentDialogProps {
  typeEquipmentToEdit?: TypeEquipment | { id: string, name: string, companyId: string, description?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TypeEquipmentDialog({ typeEquipmentToEdit, open, onOpenChange }: TypeEquipmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTypeEquipment = useCreateTypeEquipment();
  const updateTypeEquipment = useUpdateTypeEquipment();
  const companyId = useAuthStore((s) => s.companyId) ?? "";

  type FormValues = z.infer<typeof createTypeEquipmentSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(createTypeEquipmentSchema),
    defaultValues: typeEquipmentToEdit
      ? {
        name: typeEquipmentToEdit.name,
        description: typeEquipmentToEdit.description ?? "",
        companyId: typeEquipmentToEdit.companyId,
      }
      : {
        name: "",
        description: "",
        companyId,
      },
  });

  useEffect(() => {
    if (open) {
      if (typeEquipmentToEdit) {
        form.reset({
          name: typeEquipmentToEdit.name,
          description: typeEquipmentToEdit.description ?? "",
          companyId: typeEquipmentToEdit.companyId || companyId,
        });
      } else {
        form.reset({ name: "", description: "", companyId });
      }
    }
  }, [typeEquipmentToEdit, open, companyId, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      if (typeEquipmentToEdit && typeEquipmentToEdit.id) {
        await updateTypeEquipment.mutateAsync({ id: typeEquipmentToEdit.id, data: { ...data, companyId: data.companyId || companyId } });
        toast.success("Tipo de equipamento atualizado com sucesso!");
      } else {
        await createTypeEquipment.mutateAsync({ ...data, companyId: data.companyId || companyId });
        toast.success("Tipo de equipamento criado com sucesso!");
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar tipo de equipamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = isSubmitting || createTypeEquipment.isPending || updateTypeEquipment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden  dark:bg-slate-950">
        <DialogHeader className="pt-6 px-6 pb-2 border-b border-gray-100 bg-white dark:bg-slate-900/50">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {typeEquipmentToEdit ? "Editar Tipo de Equipamento" : "Novo Tipo de Equipamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">Nome *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Digite o nome do tipo de equipamento"
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700 font-medium">Descrição</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Digite a descrição do tipo de equipamento"
                  rows={4}
                  className="resize-none rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mr-6 p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="shadow-lg rounded-xl px-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                typeEquipmentToEdit ? "Atualizar" : "Criar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
