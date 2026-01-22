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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCreateContainer } from "@/infrastructure/hooks/useContainers";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { createContainerSchema } from "@/infrastructure/schema/schema-containers";

type ContainerForm = z.infer<typeof createContainerSchema>;

interface ContainerCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContainerCreateDialog({
  open,
  onOpenChange,
}: ContainerCreateDialogProps) {
  const companyId = useAuthStore((state) => state.companyId ?? "");
  const createMutation = useCreateContainer();

  const form = useForm<ContainerForm>({
    resolver: zodResolver(createContainerSchema),
    defaultValues: {
      cod: "",
      name: "",
      capacity: undefined,
      companyId: companyId,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        cod: "",
        name: "",
        capacity: undefined,
        companyId: companyId,
      });
    }
  }, [open, companyId, form]);

  const onSubmit = (values: ContainerForm) => {
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Contentor</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
            <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Contentor 1" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
     </div>
            <FormField
              control={form.control}
              name="cod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: CT-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ex: 1000"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val ? Number(val) : undefined);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>


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

