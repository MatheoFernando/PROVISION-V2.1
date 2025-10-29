"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { moduleSchema, type ModuleSchema } from "@/infrastructure/schema/schema-module";
import { z } from "zod";
import { useCompaniesQuery } from "@/infrastructure/hooks/useCompanies";
import { useUsersQuery } from "@/infrastructure/hooks/useUsers";

export function CreateService() {
  const [open, setOpen] = useState(false);
  const createModuleMutation = useCreateModule();

  const createModulePayloadSchema = moduleSchema.omit({ id: true, createdAt: true, updatedAt: true })
  type CreateModulePayload = z.infer<typeof createModulePayloadSchema>

  const form = useForm<CreateModulePayload>({
    resolver: zodResolver(createModulePayloadSchema),
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="px-6 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white">
          <Plus className="h-4 w-4 mr-2" />
          Criar Serviço
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Serviço</DialogTitle>
          <DialogDescription>
            Adicione um novo serviço ao sistema.
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
                      placeholder="Digite a descrição do serviço "
                      className="resize-none"
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
                      checked={field.value}
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
                className="cursor-pointer"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createModuleMutation.isPending} className="px-6 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white">
                {createModuleMutation.isPending
                  ? "Criando..."
                  : "Criar Serviço"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
