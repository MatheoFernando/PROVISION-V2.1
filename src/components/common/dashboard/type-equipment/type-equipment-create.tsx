"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createTypeEquipmentSchema, CreateTypeEquipment } from "@/infrastructure/schema/schema-type-equipment";
import { useCreateTypeEquipment, useUpdateTypeEquipment } from "@/infrastructure/hooks/useTypeEquipment";
import { toast } from "sonner";

interface TypeEquipmentCreateProps {
  typeEquipment?: any;
  isOpen: boolean;
  onClose: () => void;
}

export function TypeEquipmentCreate({ typeEquipment, isOpen, onClose }: TypeEquipmentCreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTypeEquipment = useCreateTypeEquipment();
  const updateTypeEquipment = useUpdateTypeEquipment();

  const form = useForm<CreateTypeEquipment>({
    resolver: zodResolver(createTypeEquipmentSchema),
    defaultValues: typeEquipment || {
      name: "",
      description: "",
      companyId: "",
    },
  });

  const onSubmit = async (data: CreateTypeEquipment) => {
    try {
      setIsSubmitting(true);
      
      if (typeEquipment) {
        await updateTypeEquipment.mutateAsync({ id: typeEquipment.id, data });
        toast.success("Tipo de equipamento atualizado com sucesso!");
      } else {
        await createTypeEquipment.mutateAsync(data);
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
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? "Salvando..." : typeEquipment ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
