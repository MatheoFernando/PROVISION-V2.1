"use client";

import React, { useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AddressSelect } from "@/components/common/base-ui/selects/address-select";
import { ContactSelect } from "@/components/common/base-ui/selects/contact-select";
import {
  createCustomerSchema,
  type CreateCustomerPayload,
} from "@/infrastructure/schema/schema-customers";
import {
  useCreateCustomer,
  useUpdateCustomer,
} from "@/infrastructure/hooks/useCustomers";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import type { Customer } from "@/infrastructure/types/domain";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type CustomerFormSchema = typeof createCustomerSchema;
type CustomerFormInput = z.input<CustomerFormSchema>;
type CustomerFormValues = z.output<CustomerFormSchema>;

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerToEdit?: Customer;
}

import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function CustomerDialog({
  open,
  onOpenChange,
  customerToEdit,
}: CustomerDialogProps) {
  const t = useTranslations("Customers");
  const tCommon = useTranslations("Common");
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const authCompanyId = useAuthStore((state) => state.companyId) || "";

  const buildDefaults = useCallback(
    (
      overrides?: Partial<CustomerFormInput>
    ): CustomerFormInput => ({
      cod: "",
      name: "",
      taxName: "",
      nif: "",
      contactId: "",
      addressId: "",
      companyId: authCompanyId,
      ...overrides,
    }),
    [authCompanyId]
  );

  const form = useForm<CustomerFormInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: buildDefaults(),
  });

  const isEditing = Boolean(customerToEdit?.id);
  const isSaving = createCustomer.isPending || updateCustomer.isPending;

  useEffect(() => {
    if (customerToEdit && open) {
      form.reset(
        buildDefaults({
          cod: customerToEdit.cod ?? "",
          name: customerToEdit.name ?? "",
          taxName: customerToEdit.taxName ?? "",
          nif: customerToEdit.nif ?? "",
          contactId: customerToEdit.contactId ?? customerToEdit.contact?.id ?? "",
          addressId: customerToEdit.addressId ?? customerToEdit.address?.id ?? "",
          companyId: customerToEdit.companyId ?? authCompanyId,
        })
      );
    } else if (open) {
      form.reset(buildDefaults());
    }
  }, [customerToEdit, open, form, buildDefaults, authCompanyId]);

  const handleSubmit = async (data: CustomerFormInput) => {
    const parsed: CustomerFormValues = createCustomerSchema.parse({
      ...data,
      companyId: data.companyId || authCompanyId,
    });

    const payload: CreateCustomerPayload = {
      ...parsed,
      companyId: parsed.companyId || authCompanyId,
    };

    try {
      if (customerToEdit?.id) {
        const { ...updateOnly } = payload;
        await updateCustomer.mutateAsync({
          id: customerToEdit.id,
          ...updateOnly,
        });
      } else {
        await createCustomer.mutateAsync(payload);
      }
      onOpenChange(false);
      if (customerToEdit?.id) {
        toast.success(t("toasts.updateSuccess"));
      } else {
        toast.success(t("toasts.createSuccess"));
      }
    } catch (error) {
      console.error("[CustomerDialog] erro ao salvar cliente:", error);
      toast.error(t("toasts.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden dark:bg-slate-950">
        <DialogHeader className="pt-6 px-6 pb-2 border-b border-gray-100 bg-white dark:bg-slate-900/50">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? t("title.edit") : t("title.create")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col"
          >
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 ">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.name")} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("placeholders.name")}
                          className="rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.cod")} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("placeholders.cod")}
                          className="rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.taxName")} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("placeholders.taxName")}
                          className="rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nif"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.nif")} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("placeholders.nif")}
                          className="rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contactId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.contact")} *</FormLabel>
                      <FormControl>
                        <ContactSelect
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          companyId={authCompanyId}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.address")} *</FormLabel>
                      <FormControl>
                        <AddressSelect
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          companyId={authCompanyId}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="shadow-lg rounded-xl px-6"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon("save")}...
                  </>
                ) : (
                  (isEditing ? tCommon("save") : tCommon("create"))
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}