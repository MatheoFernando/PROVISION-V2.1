import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCars, useCreateCar, useCarById } from "@/infrastructure/hooks/useCars";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { createCarSchema } from "@/infrastructure/schema/schema-cars";
import type { Car } from "@/infrastructure/types/domain";
import { z } from "zod";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CarForm = z.infer<typeof createCarSchema>;

interface CarSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string | null;
}

export function CarSelect({ value, onChange, companyId }: CarSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: selectedCar, isLoading } = useCarById(value);
  const createCar = useCreateCar();
  const { companyId: storeCompanyId } = useAuthStore();
  const normalizedCompanyId = companyId ?? storeCompanyId ?? "";
  const isCompanyUnavailable = !normalizedCompanyId;

  const form = useForm<CarForm>({
    resolver: zodResolver(createCarSchema),
    defaultValues: {
      cod: "",
      mark: "",
      model: "",
      capacity: 0,
      companyId: normalizedCompanyId,
    },
  });

  useEffect(() => {
    form.reset({
      cod: "",
      mark: "",
      model: "",
      capacity: 0,
      companyId: normalizedCompanyId,
    }, { keepDefaultValues: true });
  }, [normalizedCompanyId, form, open]);

  function handleSubmit(data: CarForm) {
    if (isCompanyUnavailable) return;

    createCar.mutate(
      { ...data, companyId: normalizedCompanyId },
      {
        onSuccess: (created: Car) => {
          setOpen(false);
          onChange(created.id!);
          form.reset();
        },
      }
    );
  }

  const isSaving = createCar.status === "pending";
  const displayValue = selectedCar
    ? `${selectedCar.cod} - ${selectedCar.mark} ${selectedCar.model}`
    : "";

  return (
    <div className="flex items-end gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Input
          readOnly
          value={displayValue}
          placeholder={
            isCompanyUnavailable
              ? "Selecione uma empresa primeiro"
              : "Nenhuma viatura selecionada"
          }
          disabled={isLoading || isCompanyUnavailable}
          className="w-full"
        />
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        )}
      </div>
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (isSaving || isCompanyUnavailable) return;
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="cursor-pointer shrink-0"
            disabled={isCompanyUnavailable || isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-96 p-4"
          onInteractOutside={(e) => {
            if (isSaving) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isSaving) e.preventDefault();
          }}
        >
          <div className="space-y-3">
            <h3 className="font-semibold">Adicionar viatura</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">

              <div className="space-y-2">
                <Label htmlFor="cod" className="block">
                  Código
                </Label>
                <Input
                  id="cod"
                  {...form.register("cod")}
                  className="w-full"
                  placeholder="Código da viatura"
                  disabled={isSaving}
                />
                {form.formState.errors.cod && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.cod.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mark" className="block">
                  Marca
                </Label>
                <Input
                  id="mark"
                  {...form.register("mark")}
                  className="w-full"
                  placeholder="Marca da viatura"
                  disabled={isSaving}
                />
                {form.formState.errors.mark && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.mark.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="block">
                  Modelo
                </Label>
                <Input
                  id="model"
                  {...form.register("model")}
                  className="w-full"
                  placeholder="Modelo da viatura"
                  disabled={isSaving}
                />
                {form.formState.errors.model && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.model.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity" className="block">
                  Capacidade
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  {...form.register("capacity", { valueAsNumber: true })}
                  className="w-full"
                  placeholder="0"
                  disabled={isSaving}
                />
                {form.formState.errors.capacity && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.capacity.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isSaving) return;
                  form.reset();
                  setOpen(false);
                }}
                className="cursor-pointer"
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isSaving}
                className="px-6 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => form.handleSubmit(handleSubmit)()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}