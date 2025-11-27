"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { useCreateTypeOccorrence, useTypeOccorrence } from "@/infrastructure/hooks/useTypeOccorrence";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";

interface TypeOccorrenceSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string;
}

export function TypeOccorrenceSelect({ value, onChange, companyId }: TypeOccorrenceSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data: list = [], isLoading } = useTypeOccorrence();
  const authCompanyId = useAuthStore((s) => s.companyId);
  const effectiveCompanyId = companyId ?? authCompanyId ?? undefined;
  const createMutation = useCreateTypeOccorrence();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { cod: "", description: "" },
  });

  const filtered = useMemo(
    () => (Array.isArray(list) ? list : []).filter((t: any) =>
      String(t?.description ?? "").toLowerCase().includes(query.toLowerCase()) ||
      String(t?.cod ?? "").toLowerCase().includes(query.toLowerCase())
    ),
    [list, query]
  );

  const normalizedValue = value;

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
      <Select
        value={normalizedValue || undefined}
        onValueChange={(selected) => onChange(selected)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full ">
          <SelectValue placeholder="Selecione o tipo de ocorrência" />
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        )}
        </SelectTrigger>
        <SelectContent className="w-[var(--radix-select-trigger-width)] ">
          <div className="p-1 sticky top-0 bg-popover ">
            <div className="flex items-center gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar tipos..."
                className="w-full placeholder:text-xs"
                disabled={isLoading || (Array.isArray(list) && list.length === 0)}
              />
           
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground p-3 text-center">Não há dados disponíveis.</div>
          ) : (
            <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
              {filtered.map((t: any) => (
                <SelectItem key={t.id} value={t.id} className="cursor-pointer">
                  {t.cod ? `${t.cod}` : t.description}
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
          const isSaving = createMutation.isPending;
          if (isSaving) return;
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="cursor-pointer shrink-0"
            disabled={createMutation.isPending}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-80 p-4"
          onInteractOutside={(e) => { if (createMutation.isPending) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (createMutation.isPending) e.preventDefault(); }}
        >
          <Form {...form}>
            <form
              onSubmit={(e) => { e.preventDefault(); form.handleSubmit(async (values) => {
                const created = await createMutation.mutateAsync({ ...values, companyId: effectiveCompanyId } as any);
                onChange((created as any)?.id);
                form.reset({ cod: "", description: "" });
                setOpen(false);
              })(); }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="cod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: OC-001" {...field} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Falha elétrica" {...field} className="w-full resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { if (!createMutation.isPending) { form.reset({ cod: "", description: "" }); setOpen(false); } }}
                  className="cursor-pointer"
                  disabled={createMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={createMutation.isPending}
                  onClick={() => form.handleSubmit(async (values) => {
                    const created = await createMutation.mutateAsync({ ...values, companyId: effectiveCompanyId } as any);
                    onChange((created as any)?.id);
                    form.reset({ cod: "", description: "" });
                    setOpen(false);
                  })()}
                >
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const schema = z.object({
  cod: z.string().min(1, "Código obrigatório"),
  description: z.string().min(1, "Descrição obrigatória"),
});

// schema permanece para validação do Popover
