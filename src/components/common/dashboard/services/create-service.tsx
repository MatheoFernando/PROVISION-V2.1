"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useCreateModule } from "@/infrastructure/hooks/useModules";
import { moduleSchema } from "@/infrastructure/schema/schema-module";
import { z } from "zod";

export function CreateService() {
  const [open, setOpen] = useState(false);
  const createModuleMutation = useCreateModule();

  const createModulePayloadSchema = moduleSchema.omit({ id: true, createdAt: true, updatedAt: true })
  type CreateModulePayload = z.infer<typeof createModulePayloadSchema>

  const form = useForm<CreateModulePayload, any, CreateModulePayload>({
    resolver: zodResolver(createModulePayloadSchema) as Resolver<
      z.input<typeof createModulePayloadSchema>,
      any,
      z.output<typeof createModulePayloadSchema>
    >,
    defaultValues: {
      name: "",
      status: true,
      description: ""
    },
  });

  function onSubmit(data: CreateModulePayload) {
    createModuleMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  }

  const isPending = createModuleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="px-6 py-5 text-white cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Criar Módulo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar  Módulo</DialogTitle>

        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField<CreateModulePayload>
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Módulo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome do módulo"
                      value={field.value as string}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField<CreateModulePayload>
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite a descrição do serviço "
                      className="resize-none"
                      value={field.value as string}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField<CreateModulePayload>
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
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className={`px-6 ${isPending ? 'cursor-wait opacity-90' : 'cursor-pointer'}`}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>

                    Criar Serviço
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
