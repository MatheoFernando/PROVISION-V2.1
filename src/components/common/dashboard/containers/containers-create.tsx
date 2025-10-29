"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createContainerSchema } from "@/infrastructure/schema/schema-containers";
import { Container } from "@/types/domain";
import { useCreateContainer, useUpdateContainer } from "@/infrastructure/hooks/useContainers";
import { toast } from "sonner";

interface ContainersCreateProps {
  container?: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ContainersCreate({ container, isOpen, onClose }: ContainersCreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createContainer = useCreateContainer();
  const updateContainer = useUpdateContainer();

  const form = useForm<Omit<Container, 'id' | 'createdAt' | 'updatedAt'>>({
    resolver: zodResolver(createContainerSchema),
    defaultValues: container || {
      cod: "",
      mark: "",
      model: "",
      capacity: 0,
      containerId: "",
      companyId: "",
      geoLocationEntityId: "",
    },
  });

  const onSubmit = async (data: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsSubmitting(true);
      
      if (container) {
        await updateContainer.mutateAsync({ id: container.id, data });
        toast.success("Container atualizado com sucesso!");
      } else {
        await createContainer.mutateAsync(data);
        toast.success("Container criado com sucesso!");
      }
      
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar container");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {container ? "Editar Container" : "Novo Container"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cod">Código *</Label>
              <Input
                id="cod"
                {...form.register("cod")}
                placeholder="Digite o código"
              />
              {form.formState.errors.cod && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.cod.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mark">Marca *</Label>
              <Input
                id="mark"
                {...form.register("mark")}
                placeholder="Digite a marca"
              />
              {form.formState.errors.mark && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.mark.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                {...form.register("model")}
                placeholder="Digite o modelo"
              />
              {form.formState.errors.model && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.model.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade (L) *</Label>
              <Input
                id="capacity"
                type="number"
                {...form.register("capacity", { valueAsNumber: true })}
                placeholder="Digite a capacidade"
              />
              {form.formState.errors.capacity && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.capacity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="containerId">ID do Container</Label>
              <Input
                id="containerId"
                {...form.register("containerId")}
                placeholder="Digite o ID do container"
              />
              {form.formState.errors.containerId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.containerId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyId">ID da Empresa *</Label>
              <Input
                id="companyId"
                {...form.register("companyId")}
                placeholder="Digite o ID da empresa"
              />
              {form.formState.errors.companyId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.companyId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="geoLocationEntityId">ID da Localização Geográfica *</Label>
              <Input
                id="geoLocationEntityId"
                {...form.register("geoLocationEntityId")}
                placeholder="Digite o ID da localização"
              />
              {form.formState.errors.geoLocationEntityId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.geoLocationEntityId.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : container ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
