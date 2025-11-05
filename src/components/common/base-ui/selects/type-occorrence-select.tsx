"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
  const { data: list = [], isLoading } = useTypeOccorrence();
  const dialogRef = useRef<CreateTypeOccorrenceDialogHandle>(null);
  const authCompanyId = useAuthStore((s) => s.companyId);
  const effectiveCompanyId = companyId ?? authCompanyId ?? undefined;

  const filtered = useMemo(
    () => (Array.isArray(list) ? list : []).filter((t: any) =>
      String(t?.description ?? "").toLowerCase().includes(query.toLowerCase()) ||
      String(t?.cod ?? "").toLowerCase().includes(query.toLowerCase())
    ),
    [list, query]
  );

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full ">
          <SelectValue placeholder="Selecione o tipo de ocorrência" />
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        )}
        </SelectTrigger>
        <SelectContent className="w-[var(--radix-select-trigger-width)] ">
          <div className="p-2 sticky top-0 bg-popover ">
            <div className="flex items-center gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar tipos..."
                className="w-full"
                disabled={isLoading || (Array.isArray(list) && list.length === 0)}
              />
           
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground p-3 text-center">Não há dados disponíveis.</div>
          ) : (
            <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
              {filtered.map((t: any) => (
                <SelectItem key={t.id} value={t.id!} className="cursor-pointer">
                  {t.cod ? `${t.cod} — ${t.description}` : t.description}
                </SelectItem>
              ))}
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => {
          dialogRef.current?.open();
        }}
        className="cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4" />
      </Button>
      <CreateTypeOccorrenceDialog ref={dialogRef} companyId={effectiveCompanyId} onCreated={() => {}} hasTrigger={false} />
    </div>
  );
}

const schema = z.object({
  cod: z.string().min(1, "Código obrigatório"),
  description: z.string().min(1, "Descrição obrigatória"),
});

interface CreateTypeOccorrenceDialogProps {
  companyId?: string;
  onCreated?: () => void;
  hasTrigger?: boolean;
}

interface CreateTypeOccorrenceDialogHandle {
  open: () => void;
  close: () => void;
}

const CreateTypeOccorrenceDialog = forwardRef<CreateTypeOccorrenceDialogHandle, CreateTypeOccorrenceDialogProps>(function CreateTypeOccorrenceDialog(
  { companyId, onCreated, hasTrigger = true },
  ref
) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateTypeOccorrence();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { cod: "", description: "" },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) form.reset({ cod: "", description: "" });
  }

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }), []);

  async function onSubmit(values: z.infer<typeof schema>) {
    await createMutation.mutateAsync({ ...values, companyId: companyId ?? undefined } as any);
    handleOpenChange(false);
    onCreated?.();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {hasTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" title="Novo tipo" className="shrink-0 cursor-pointer">
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo tipo de ocorrência</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: OC-001" {...field} />
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
              <DialogClose asChild>
                <Button type="button" variant="outline" className="cursor-pointer">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={createMutation.isPending} className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white">
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});
