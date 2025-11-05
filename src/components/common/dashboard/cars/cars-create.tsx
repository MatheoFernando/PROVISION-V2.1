"use client";

import { useState } from "react";
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
import { useCreateCar } from "@/infrastructure/hooks/useCars";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useRouter } from "next/navigation";

type CreateCarInput = z.infer<typeof createCarSchema>;

export function CarsCreate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCar = useCreateCar();
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

  const onSubmit = async (data: CreateCarInput) => {
    try {
      setIsSubmitting(true);
      const { containerId, geoLocationId, ...rest } = data as any;
      const payload = {
        ...rest,
      } as CreateCarInput;
      await createCar.mutateAsync(payload as any);
      form.reset();
      router.back();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen ">
  
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Nova viatura</h1>
        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg px-6 cursor-pointer"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6"
              >
                {isSubmitting ? "Salvando..." : "Criar"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    
  );
}
