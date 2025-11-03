"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createContainerSchema } from "@/infrastructure/schema/schema-containers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateContainer, useUpdateContainer, useContainer } from "@/infrastructure/hooks/useContainers";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { Container } from "@/types/domain";

interface CreateContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  container?: Container;
  onCreated?: (container: Container) => void;
}

type CreateContainerInput = z.infer<typeof createContainerSchema>;

export function CreateContainerModal({ isOpen, onClose, container, onCreated }: CreateContainerModalProps) {
  const { companyId } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createContainer = useCreateContainer();
  const updateContainer = useUpdateContainer();
  const { data: containerData } = useContainer(container?.id);

  const form = useForm<CreateContainerInput>({
    resolver: zodResolver(createContainerSchema),
    defaultValues: {
      cod: container?.cod ?? "",
      name: (container as any)?.name ?? "",
      capacity: (container as any)?.capacity ?? 0,
      companyId: companyId ?? "",
    },
  });

  if (container?.id && containerData) {
    form.reset({
      cod: (containerData as any)?.cod ?? "",
      name: (containerData as any)?.name ?? "",
      capacity: (containerData as any)?.capacity ?? 0,
      companyId: companyId ?? "",
    });
  }

  const onSubmit = async (data: CreateContainerInput) => {
    try {
      if (!companyId) return;
      setIsSubmitting(true);
      if (container?.id) {
        await (updateContainer.mutateAsync as (vars: { id: string; data: any }) => Promise<Container>)(
          { id: container.id, data: { cod: data.cod, name: data.name, capacity: data.capacity } }
        );
        onClose();
      } else {
        const created = await createContainer.mutateAsync({ ...data, companyId });
        onClose();
        if (created && onCreated) onCreated(created as unknown as Container);
      }
    } catch (_) {
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{container?.id ? "Editar Container" : "Novo Container"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cod">Código *</Label>
              <Input id="cod" {...form.register("cod")} placeholder="CNT-001" />
              {form.formState.errors.cod && (
                <p className="text-sm text-red-500">{form.formState.errors.cod.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" {...form.register("name")} placeholder="Nome do container" />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
         
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade (L) *</Label>
              <Input id="capacity" type="number" {...form.register("capacity", { valueAsNumber: true })} placeholder="0" />
              {form.formState.errors.capacity && (
                <p className="text-sm text-red-500">{form.formState.errors.capacity.message}</p>
              )}
            </div>
        
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" className="rounded-lg cursor-pointer" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6">
              {isSubmitting ? "Salvando..." : container?.id ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

