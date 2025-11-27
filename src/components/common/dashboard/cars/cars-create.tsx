"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useRouter } from "next/navigation";

type CreateCarInput = z.infer<typeof createCarSchema>;

interface CarsCreateProps {
  id?: string;
  initialData?: Partial<CreateCarInput> & { id?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CarsCreate(props: CarsCreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCar = useCreateCar();
  const updateCar = useUpdateCar();
  const { companyId } = useAuthStore();
  const router = useRouter();

  const form = useForm<CreateCarInput>({
    resolver: zodResolver(createCarSchema),
    defaultValues: {
      cod: "",
      mark: "",
      model: "",
      capacity: "",
      companyId: companyId ?? "",
      geoLocationId: "",
    },
  });

  useEffect(() => {
    const d = props.initialData;
    if (!d) return;
    form.reset({
      cod: d.cod || "",
      mark: d.mark || "",
      model: d.model || "",
      capacity: (d as any).capacity ? String((d as any).capacity) : "",
      companyId: d.companyId || companyId || "",
      geoLocationId: (d as any).geoLocationId || "",
    } as any);
  }, [props.initialData, form, companyId]);

  const onSubmit = async (data: CreateCarInput) => {
    try {
      setIsSubmitting(true);
      if (props.id) {
        const { containerId, geoLocationId, ...updatePayload } = data as any;
        await updateCar.mutateAsync({ id: props.id, data: updatePayload as any });
      } else {
        const { containerId, geoLocationId, ...createPayload } = data as any;
        await createCar.mutateAsync({ ...createPayload, companyId: companyId || (data as any).companyId } as any);
      }
      if (props.onSuccess) props.onSuccess(); else form.reset();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="py-4 space-y-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
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
                  {(form.formState.errors as any)?.model?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade *</Label>
              <Select
                value={String(form.watch("capacity"))}
                onValueChange={(v) => {
                  form.setValue("capacity", v as any);
                }}
              >
                <SelectTrigger id="capacity" className="w-full">
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
                <p className="text-sm text-red-500">
                  {form.formState.errors.capacity.message as any}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="geoLocationEntityId">Localização *</Label>
              <Input
                id="geoLocationEntityId"
                {...form.register("geoLocationId")}
                placeholder="Digite o ID da localização"
              />
              {form.formState.errors.geoLocationId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.geoLocationId.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg px-6 cursor-pointer"
              onClick={() => (props.onCancel ? props.onCancel() : router.back())}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createCar.isPending || updateCar.isPending}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6"
            >
              {isSubmitting || createCar.isPending || updateCar.isPending
                ? "Salvando..."
                : props.id
                  ? "Atualizar"
                  : "Criar"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
