"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCreateTypeOccurrenceMutation } from "@/infrastructure/hooks/useTypeOccurrences";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { typeOccurrenceSchema } from "@/infrastructure/schema/schema-type-occurrence";

type TypeOccurrenceForm = z.infer<typeof typeOccurrenceSchema>;

interface TypeOccurrenceCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TypeOccurrenceCreateDialog({
  open,
  onOpenChange,
}: TypeOccurrenceCreateDialogProps) {
  const companyId = useAuthStore((state) => state.companyId ?? "");
  const createMutation = useCreateTypeOccurrenceMutation();

  const form = useForm<TypeOccurrenceForm>({
    resolver: zodResolver(typeOccurrenceSchema),
    defaultValues: {
      cod: "",
      description: "",
      companyId: companyId,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        cod: "",
        description: "",
        companyId: companyId,
      });
    }
  }, [open, companyId, form]);

  const onSubmit = (values: TypeOccurrenceForm) => {
    createMutation.mutate(
      { ...values, companyId },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      }
    );
  };

  const isSubmitting = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo Tipo de Ocorrência</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código *</FormLabel>
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
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Falha elétrica"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  "Criar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

