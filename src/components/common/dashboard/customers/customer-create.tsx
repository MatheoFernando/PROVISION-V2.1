"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, Upload } from "lucide-react";
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

type CustomerFormSchema = typeof createCustomerSchema;
type CustomerFormInput = z.input<CustomerFormSchema>;
type CustomerFormValues = z.output<CustomerFormSchema>;

interface CustomersCreateFormProps {
  customer?: Customer;
  onSuccess?: (customer?: Customer) => void;
  onCancel?: () => void;
}

export function CustomersCreateForm({
  customer,
  onSuccess,
  onCancel,
}: CustomersCreateFormProps) {
  const router = useRouter();
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

  const isEditing = Boolean(customer?.id);
  const isSaving = createCustomer.isPending || updateCustomer.isPending;

  useEffect(() => {
    if (!customer) {
      form.reset(buildDefaults());
      return;
    }

    form.reset(
      buildDefaults({
        cod: customer.cod ?? "",
        name: customer.name ?? "",
        taxName: customer.taxName ?? "",
        nif: customer.nif ?? "",
        contactId: customer.contactId ?? "",
        addressId: customer.addressId ?? "",
        companyId: customer.companyId ?? authCompanyId,
      })
    );
    

  }, [customer, form, buildDefaults, authCompanyId]);



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
      let savedCustomer: Customer | undefined;
      if (customer?.id) {
        const { ...updateOnly } = payload;
        savedCustomer = await updateCustomer.mutateAsync({
          id: customer.id,
          data: updateOnly
        });
      } else {
        savedCustomer = await createCustomer.mutateAsync(payload);
        form.reset(buildDefaults());
      }

      if (onSuccess) onSuccess(savedCustomer);
      else router.back();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-8"
      >
        <div className="grid gap-6 md:grid-cols-2">
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Digite o nome"
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
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Digite o código"
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
                <FormLabel>Nome fiscal *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Digite o nome fiscal"
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
                <FormLabel>NIF *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Digite o NIF"
                    className="rounded-lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Seleções */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="contactId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contato *</FormLabel>
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
                <FormLabel>Endereço *</FormLabel>
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

       
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-6 ">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto cursor-pointer"
            onClick={() => {
              if (onCancel) onCancel();
              else router.back();
            }}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto cursor-pointer"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              (isEditing ? "Atualizar Cliente" : "Criar Cliente")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}