"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import { moduleSchema, type ModuleSchema } from "@/infrastructure/schema/schema-module";
import { useUpdateModule } from "@/infrastructure/hooks/useModules";

interface EditServiceProps {
  service: ModuleSchema;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditService({ service, open, onOpenChange }: EditServiceProps) {
  const updateModuleMutation = useUpdateModule();

  const form = useForm<Partial<ModuleSchema>>({
    resolver: zodResolver(moduleSchema.partial()),
    defaultValues: {
      name: service.name,
      description: service.description || "",
      status: (() => {
        const raw = service.status as unknown;
        return typeof raw === 'string'
          ? raw.toLowerCase() === 'true' || raw === '1'
          : Boolean(service.status);
      })(),
    },
  });

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description || "",
        status: (() => {
          const raw = service.status as unknown;
          return typeof raw === 'string'
            ? raw.toLowerCase() === 'true' || raw === '1'
            : Boolean(service.status);
        })(),
      });
    }
  }, [service, form]);

  function onSubmit(data: Partial<ModuleSchema>) {
    updateModuleMutation.mutate({ id: service.id!, ...data }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Serviço</DialogTitle>
          <DialogDescription>
            Atualize as informações do serviço.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do serviço" {...field} />
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
                    <Textarea
                      className="resize-none"
                      placeholder="Digite a descrição do serviço"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Serviço Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      O serviço estará disponível para uso
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      className="cursor-pointer"
                      checked={
                        typeof field.value === 'string'
                          ? field.value === 'true' || field.value === '1'
                          : Boolean(field.value)
                      }
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateModuleMutation.isPending} className="cursor-pointer">
                {updateModuleMutation.isPending
                  ? "Atualizando..."
                  : "Atualizar Serviço"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
