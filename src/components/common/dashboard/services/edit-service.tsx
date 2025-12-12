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
import { useTranslations } from "next-intl";

interface EditServiceProps {
  service: ModuleSchema;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditService({ service, open, onOpenChange }: EditServiceProps) {
  const t = useTranslations("ServicesManagement");
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
          <DialogTitle>{t("titles.editService")}</DialogTitle>
          <DialogDescription>
            {t("descriptions.updateServiceInfo")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.serviceName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("placeholders.enterServiceName")} {...field} />
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
                  <FormLabel>{t("fields.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder={t("placeholders.enterDescription")}
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
                    <FormLabel>{t("fields.active")}</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {t("messages.serviceAvailable")}
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
                {t("buttons.cancel")}
              </Button>
              <Button type="submit" disabled={updateModuleMutation.isPending} className="cursor-pointer">
                {updateModuleMutation.isPending
                  ? t("buttons.updating")
                  : t("buttons.updateService")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
