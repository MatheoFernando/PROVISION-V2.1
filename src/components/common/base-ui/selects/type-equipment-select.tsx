"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { useCreateTypeEquipment, useTypeEquipment } from "@/infrastructure/hooks/useTypeEquipment";
import { createTypeEquipmentSchema } from "@/infrastructure/schema/schema-type-equipment";
import type { TypeEquipment } from "@/infrastructure/types/domain";
import { toast } from "sonner";

interface TypeEquipmentSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
}

type CreateTypeEquipment = Pick<TypeEquipment, "name" | "description" | "companyId">;

export function TypeEquipmentSelect({ value, onChange, companyId }: TypeEquipmentSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: list = [], isLoading } = useTypeEquipment();
  const createTypeEquipment = useCreateTypeEquipment();

  const form = useForm<CreateTypeEquipment>({
    resolver: zodResolver(createTypeEquipmentSchema),
    defaultValues: { name: "", description: "", companyId },
  });

  function handleSubmit(data: CreateTypeEquipment) {
    createTypeEquipment.mutate(
      { ...data, companyId: data.companyId || companyId },
      {
        onSuccess: (created) => {
          toast.success("Tipo de equipamento criado com sucesso!");
          setOpen(false);
          onChange(created.id!);
          form.reset({ name: "", description: "", companyId });
        },
        onError: () => {
          toast.error("Erro ao criar tipo de equipamento");
        },
      }
    );
  }

  const filtered = (Array.isArray(list) ? list : []).filter((t: any) =>
    String(t?.name ?? "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select value={value} onValueChange={onChange} disabled={isLoading}>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Selecione o tipo de equipamento" />
          </SelectTrigger>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-2 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar tipos..."
                className="w-full"
                disabled={isLoading || (list as any)?.length === 0}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">Não há dados disponíveis.</div>
            ) : (
              <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                {filtered.map((t: TypeEquipment) => (
                  <SelectItem key={t.id} value={t.id!} className="cursor-pointer">
                    {t.name}
                  </SelectItem>
                ))}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
      <Popover
        open={open}
        onOpenChange={(next) => {
          const isSaving = createTypeEquipment.status === "pending";
          if (isSaving) return;
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 cursor-pointer"
            disabled={createTypeEquipment.status === "pending"}
            aria-label="Criar tipo de equipamento"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-80 p-4"
          onInteractOutside={(e) => {
            if (createTypeEquipment.status === "pending") e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (createTypeEquipment.status === "pending") e.preventDefault();
          }}
        >
          <div className="space-y-3">
            <Label htmlFor="type_name" className="block">Nome</Label>
            <Input
              id="type_name"
              {...form.register("name")}
              className="w-full"
              placeholder="Nome"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            />
            {form.formState.errors.name && (
              <span className="text-red-500 text-xs">{form.formState.errors.name.message}</span>
            )}
            <Label htmlFor="type_desc" className="block">Descrição</Label>
            <Textarea id="type_desc" rows={3} {...form.register("description")} placeholder="Descrição" />
            {form.formState.errors.description && (
              <span className="text-red-500 text-xs">{(form.formState.errors.description as any)?.message}</span>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (createTypeEquipment.status === "pending") return;
                  form.reset({ name: "", description: "", companyId });
                  setOpen(false);
                }}
                className="cursor-pointer"
                disabled={createTypeEquipment.status === "pending"}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={createTypeEquipment.status === "pending"}
                className="px-6 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => form.handleSubmit(handleSubmit)()}
              >
                {createTypeEquipment.status === "pending" ? (
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


