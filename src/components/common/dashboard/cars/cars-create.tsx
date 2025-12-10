"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCarSchema } from "@/infrastructure/schema/schema-cars";
import { z } from "zod";
import { useCreateCar, useUpdateCar } from "@/infrastructure/hooks/useCars";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { Loader2 } from "lucide-react";
import { Car } from "@/infrastructure/types/domain";

type CreateCarInput = z.infer<typeof createCarSchema>;

interface CarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carToEdit?: Car;
}

export function CarDialog({ open, onOpenChange, carToEdit }: CarDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCar = useCreateCar();
  const updateCar = useUpdateCar();
  const { companyId } = useAuthStore();

  const form = useForm<CreateCarInput>({
    resolver: zodResolver(createCarSchema),
    defaultValues: {
      cod: "",
      mark: "",
      model: "",
      capacity: 0,
      companyId: companyId ?? "",
      geoLocationId: "",
    },
  });

  useEffect(() => {
    if (carToEdit && open) {
      form.reset({
        cod: carToEdit.cod || "",
        mark: carToEdit.mark || "",
        model: carToEdit.model || "",
        capacity: (carToEdit as any).capacity ? Number((carToEdit as any).capacity) : 0,
        companyId: carToEdit.companyId || companyId || "",
        geoLocationId: (carToEdit as any).geoLocationId || "",
      } as any);
    } else if (open) {
      // Reset to default when opening for creation
      form.reset({
        cod: "",
        mark: "",
        model: "",
        capacity: 0,
        companyId: companyId ?? "",
        geoLocationId: "",
      });
    }
  }, [carToEdit, form, companyId, open]);

  const onSubmit = async (data: CreateCarInput) => {
    try {
      setIsSubmitting(true);
      if (carToEdit && carToEdit.id) {
        const { containerId, geoLocationId, ...updatePayload } = data as any;
        await updateCar.mutateAsync({ id: carToEdit.id, data: updatePayload as any });
      } else {
        const { containerId, geoLocationId, ...createPayload } = data as any;
        await createCar.mutateAsync({ ...createPayload, companyId: companyId || (data as any).companyId } as any);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = isSubmitting || createCar.isPending || updateCar.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden  dark:bg-slate-950">
        <DialogHeader className="pt-6 px-6 pb-2 border-b border-gray-100 bg-white dark:bg-slate-900/50">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {carToEdit ? "Editar Viatura" : "Nova Viatura"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="space-y-2">
              <Label htmlFor="cod" className="text-slate-700 font-medium">Código *</Label>
              <Input
                id="cod"
                {...form.register("cod")}
                placeholder="Ex: VT-001"
                className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              />
              {form.formState.errors.cod && (
                <p className="text-sm text-red-500 font-medium">
                  {form.formState.errors.cod.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mark" className="text-slate-700 font-medium">Marca *</Label>
                <Input
                  id="mark"
                  {...form.register("mark")}
                  placeholder="Ex: Toyota"
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
                {form.formState.errors.mark && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.mark.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-slate-700 font-medium">Modelo *</Label>
                <Input
                  id="model"
                  {...form.register("model")}
                  placeholder="Ex: Hilux"
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
                {form.formState.errors.model && (
                  <p className="text-sm text-red-500 font-medium">
                    {(form.formState.errors as any)?.model?.message}
                  </p>
                )}
              </div>
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-slate-700 font-medium">Capacidade *</Label>
              <Select
                value={String(form.watch("capacity") || "")}
                onValueChange={(v) => {
                  form.setValue("capacity", Number(v));
                }}
              >
                <SelectTrigger id="capacity" className="w-full rounded-xl border-gray-200 bg-white">
                  <SelectValue placeholder="Selecione a capacidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="110">110 LT</SelectItem>
                  <SelectItem value="240">240 LT</SelectItem>
                  <SelectItem value="1100">1100 LT</SelectItem>
                  <SelectItem value="6000">6 m³</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.capacity && (
                <p className="text-sm text-red-500 font-medium">
                  {form.formState.errors.capacity.message as any}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="geoLocationEntityId" className="text-slate-700 font-medium">Localização *</Label>
              <Input
                id="geoLocationEntityId"
                {...form.register("geoLocationId")}
                placeholder="ID da Geolocalização"
                className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              />
              {form.formState.errors.geoLocationId && (
                <p className="text-sm text-red-500 font-medium">
                  {form.formState.errors.geoLocationId.message}
                </p>
              )}
            </div>
            </div>

          </div>

          <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
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
              ) : carToEdit ? (
                "Atualizar Dados"
              ) : (
                "Criar Viatura"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

