"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createCarSchema, CreateCar } from "@/infrastructure/schema/schema-cars";
import { useCreateCar, useUpdateCar } from "@/infrastructure/hooks/useCars";
import { toast } from "sonner";

interface CarsCreateProps {
  car?: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CarsCreate({ car, isOpen, onClose }: CarsCreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCar = useCreateCar();
  const updateCar = useUpdateCar();

  const form = useForm<CreateCar>({
    resolver: zodResolver(createCarSchema),
    defaultValues: car || {
      cod: "",
      mark: "",
      capacity: 0,
      containerId: "",
      companyId: "",
      geoLocationEntityId: "",
    },
  });

  const onSubmit = async (data: CreateCar) => {
    try {
      setIsSubmitting(true);
      
      if (car) {
        await updateCar.mutateAsync({ id: car.id, data });
        toast.success("Veículo atualizado com sucesso!");
      } else {
        await createCar.mutateAsync(data);
        toast.success("Veículo criado com sucesso!");
      }
      
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar veículo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {car ? "Editar Veículo" : "Novo Veículo"}
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
              <Label htmlFor="containerId">ID do Container *</Label>
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
              {isSubmitting ? "Salvando..." : car ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
