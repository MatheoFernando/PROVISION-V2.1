import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useContainer, useCreateContainer } from "@/infrastructure/hooks/useContainers";
import { Loader2, Plus } from "lucide-react";
import { createContainerSchema } from "@/infrastructure/schema/schema-containers";
import type { Container } from "@/infrastructure/types/domain";
import { z } from "zod";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ContainerForm = z.infer<typeof createContainerSchema>;

interface ContainerSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string | null;
}

export function ContainerSelect({
  value,
  onChange,
  companyId,
}: ContainerSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: selectedContainer, isLoading } = useContainer(value);
  const createContainer = useCreateContainer();
  const { companyId: storeCompanyId } = useAuthStore();
  const normalizedCompanyId = companyId ?? storeCompanyId ?? "";
  const isCompanyUnavailable = !normalizedCompanyId;

  const form = useForm<ContainerForm>({
    resolver: zodResolver(createContainerSchema),
    defaultValues: {
      name: "",
      cod: "",
      capacity: 0,
      companyId: normalizedCompanyId,
    },
  });

  useEffect(() => {
    form.reset({
      name: "",
      cod: "",
      capacity: 0,
      companyId: normalizedCompanyId,
    }, { keepDefaultValues: true });
  }, [normalizedCompanyId, form, open]);

  function handleSubmit(data: ContainerForm) {
    if (isCompanyUnavailable) return;

    createContainer.mutate(
      { ...data, companyId: normalizedCompanyId },
      {
        onSuccess: (created: Container) => {
          setOpen(false);
          onChange(created.id!);
          form.reset();
        },
      }
    );
  }

  const isSaving = createContainer.status === "pending";
  const displayValue = selectedContainer
    ? `${selectedContainer.cod} - ${selectedContainer.name}`
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
              : "Nenhum container selecionado"
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
          className="w-80 p-4"
          onInteractOutside={(e) => {
            if (isSaving) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isSaving) e.preventDefault();
          }}
        >
          <div className="space-y-3">
            <h3 className="font-semibold">Adicionar container</h3>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="cod" className="block">
                  Código
                </Label>
                <Input
                  id="cod"
                  {...form.register("cod")}
                  className="w-full"
                  placeholder="Código do container"
                  disabled={isSaving}
                />
                {form.formState.errors.cod && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.cod.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="block">
                  Nome
                </Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  className="w-full"
                  placeholder="Nome do container"
                  disabled={isSaving}
                />
                {form.formState.errors.name && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.name.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity" className="block">
                  Capacidade
                </Label>
                <Input
                  id="capacity"
                  {...form.register("capacity")}
                  className="w-full"
                  placeholder="Capacidade do container"
                  disabled={isSaving}
                  type="number"
                />

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
                    <Loader2 className="w-4 h-4 animate-spin" /> A guardar...
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