"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Loader2 } from "lucide-react";
import { api } from "@/infrastructure/utils/api";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import {
  createCompanyModuleSchema,
  type CreateCompanyModule,
} from "@/infrastructure/schema/schema-company-module";
import { useModules } from "@/infrastructure/hooks/useModules";
import { type ModuleSchema } from "@/infrastructure/schema/schema-module";
import { CompanySelect } from "@/components/common/base-ui/selects/company-select";

interface AssociateServiceCompanyProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  moduleId?: string;
  moduleName?: string;
}

export function AssociateServiceCompany({
  open,
  onOpenChange,
  moduleId,
  moduleName,
}: AssociateServiceCompanyProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const openState = isControlled ? open! : internalOpen;
  const setOpenState = (value: boolean) =>
    isControlled ? onOpenChange?.(value) : setInternalOpen(value);

  const { data: services = [] } = useModules();

  const resolvedModule = useMemo(() => {
    if (!moduleId) return undefined;
    return services.find((s: ModuleSchema) => s.id === moduleId);
  }, [moduleId, services]);

  const form = useForm<CreateCompanyModule>({
    resolver: zodResolver(createCompanyModuleSchema),
    defaultValues: {
      companyId: "",
      moduleId: moduleId ?? "",
      status: true,
    },
  });

  function onSubmit(data: CreateCompanyModule) {
    (async () => {
      setSubmitting(true);
      try {
        const payload = { ...data, status: String(data.status) } as any;
        const { data: resp } = await api.post('/company-modules', payload);
        toast.success('Associação criada com sucesso');
        form.reset();
        setOpenState(false);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Erro ao criar associação');
      } finally {
        setSubmitting(false);
      }
    })();
  }

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (moduleId) form.setValue("moduleId", moduleId);
  }, [moduleId, form]);

  return (
    <Dialog open={openState} onOpenChange={setOpenState}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Associar Serviço a Empresa</DialogTitle>
          <DialogDescription>
            Vincule um serviço a uma ou mais empresas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <CompanySelect 
                      value={field.value} 
                      onChange={field.onChange} 
                      required 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {moduleId ? (
              <FormItem>
                <FormLabel>Serviços</FormLabel>
                <div className="flex items-center gap-2 rounded-md border p-2">
                  <Briefcase className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>
                      {moduleName || resolvedModule?.name || "Serviço selecionado"}
                    </span>
                    {resolvedModule?.description && (
                      <span className="text-xs text-muted-foreground">
                        {resolvedModule.description}
                      </span>
                    )}
                  </div>
                </div>
              </FormItem>
            ) : (
              <FormField
                control={form.control}
                name="moduleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Módulo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger disabled={submitting}>
                          <SelectValue placeholder="Selecione um módulo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service: ModuleSchema) => (
                          <SelectItem key={service.id} value={service.id!}>
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              <div className="flex flex-col">
                                <span>{service.name}</span>
                                {service.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {service.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Associação Ativa</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      A associação estará disponível para uso
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={submitting}
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
                onClick={() => setOpenState(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className={`px-6 bg-blue-600 hover:bg-blue-700 text-white ${submitting ? 'cursor-wait opacity-90' : 'cursor-pointer'}`}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Atribuindo...
                  </>
                ) : (
                  'Atribuir'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
