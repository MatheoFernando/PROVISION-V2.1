"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateTypeEquipment, useUpdateTypeEquipment } from "@/infrastructure/hooks/useTypeEquipment";
import { toast } from "sonner";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { TypeEquipment } from "@/infrastructure/types/domain";
import { createTypeEquipmentSchema } from "@/infrastructure/schema/schema-type-equipment";
import { Loader2 } from "lucide-react";

interface TypeEquipmentCreateProps {
  typeEquipment?: TypeEquipment;
  isOpen: boolean;
  onClose: () => void;
}

export function TypeEquipmentCreate({ typeEquipment, isOpen, onClose }: TypeEquipmentCreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTypeEquipment = useCreateTypeEquipment();
  const updateTypeEquipment = useUpdateTypeEquipment();
  const companyId = useAuthStore((s) => s.companyId) ?? "";

  type CreateTypeEquipment = Omit<TypeEquipment, "id" | "createdAt" | "updatedAt">;

  const form = useForm<CreateTypeEquipment>({
    resolver: zodResolver(createTypeEquipmentSchema),
    defaultValues: typeEquipment
      ? {
          name: typeEquipment.name,
          description: typeEquipment.description ?? "",
          companyId: typeEquipment.companyId,
        }
      : {
      name: "",
      description: "",
      companyId,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (typeEquipment) {
        form.reset({
          name: typeEquipment.name,
          description: typeEquipment.description ?? "",
          companyId: typeEquipment.companyId || companyId,
        });
      } else {
        form.reset({ name: "", description: "", companyId });
      }
    }
  }, [typeEquipment, isOpen, companyId, form]);

  const onSubmit = async (data: CreateTypeEquipment) => {
    try {
      setIsSubmitting(true);
      
      if (typeEquipment && typeEquipment.id) {
        await updateTypeEquipment.mutateAsync({ id: typeEquipment.id, data: { ...data, companyId: data.companyId || companyId } });
        toast.success("Tipo de equipamento atualizado com sucesso!");
      } else {
        await createTypeEquipment.mutateAsync({ ...data, companyId: data.companyId || companyId });
        toast.success("Tipo de equipamento criado com sucesso!");
      }
      
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar tipo de equipamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {typeEquipment ? "Editar Tipo de Equipamento" : "Novo Tipo de Equipamento"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
         
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Digite o nome do tipo de equipamento"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>


          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Digite a descrição do tipo de equipamento"
              rows={4}
              className="resize-none"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </span>
              ) : (
                typeEquipment ? "Atualizar" : "Criar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
