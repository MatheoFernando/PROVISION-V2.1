"use client";

import React, { useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateGrossCustomer,
  useUpdateCustomer,
} from "@/infrastructure/hooks/useCustomers";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useAngolaProvinces } from "@/infrastructure/hooks/useAngolaLocations";
import type { Customer } from "@/infrastructure/types/domain";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const grossCustomerSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  taxName: z.string().min(1, "Nome fiscal é obrigatório"),
  nif: z.string().min(1, "NIF é obrigatório"),
  photo: z.string().optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  houseHold: z.string().optional().or(z.literal("")),
  commune: z.string().optional().or(z.literal("")),
  municipality: z.string().optional().or(z.literal("")),
  province: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
});

type GrossCustomerInput = z.infer<typeof grossCustomerSchema>;

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerToEdit?: Customer;
}

export function CustomerDialog({
  open,
  onOpenChange,
  customerToEdit,
}: CustomerDialogProps) {
  const t = useTranslations("Customers");
  const tCommon = useTranslations("Common");
  const createGrossCustomer = useCreateGrossCustomer();
  const updateCustomer = useUpdateCustomer();
  
  const authCompanyId = useAuthStore((state) => state.companyId) || "";
  
  const form = useForm<GrossCustomerInput>({
    resolver: zodResolver(grossCustomerSchema),
    defaultValues: {
      cod: "",
      name: "",
      taxName: "",
      nif: "",
      photo: "",
      companyId: authCompanyId,
      email: "",
      phone: "",
      houseHold: "",
      commune: "",
      municipality: "",
      province: "",
      country: "Angola",
    },
  });

  const isEditing = Boolean(customerToEdit?.id);
  const isSaving = createGrossCustomer.isPending || updateCustomer.isPending;

  const { data: provincesData = [], isPending: loadingProvinces } = useAngolaProvinces();
  const provinceValue = form.watch("province");
  const municipalityValue = form.watch("municipality");

  const selectedProvince = useMemo(
    () => provincesData.find((province) => province.name === provinceValue) ?? null,
    [provincesData, provinceValue]
  );

  const municipalities = useMemo(
    () => selectedProvince?.municipalities ?? [],
    [selectedProvince]
  );

  const selectedMunicipality = useMemo(
    () => municipalities.find((municipality) => municipality.name === municipalityValue) ?? null,
    [municipalities, municipalityValue]
  );

  const communes = selectedMunicipality?.communes ?? [];

  useEffect(() => {
    if (authCompanyId && form.getValues("companyId") !== authCompanyId) {
      form.setValue("companyId", authCompanyId);
    }
  }, [authCompanyId, form]);

  useEffect(() => {
    if (customerToEdit && open) {
      form.reset({
        cod: customerToEdit.cod ?? "",
        name: customerToEdit.name ?? "",
        taxName: customerToEdit.taxName ?? "",
        nif: customerToEdit.nif ?? "",
        photo: customerToEdit.photo ?? "",
        companyId: customerToEdit.companyId ?? authCompanyId,
        email: customerToEdit.contact?.email ?? "",
        phone: customerToEdit.contact?.phoneNumbers?.[0]?.phone ?? "",
        houseHold: customerToEdit.address?.houseHold ?? "",
        commune: customerToEdit.address?.commune ?? "",
        municipality: customerToEdit.address?.municipality ?? "",
        province: customerToEdit.address?.province ?? "",
        country: customerToEdit.address?.country ?? "",
      });
    } else if (open) {
      form.reset({
        cod: "",
        name: "",
        taxName: "",
        nif: "",
        photo: "",
        companyId: authCompanyId,
        email: "",
        phone: "",
        houseHold: "",
        commune: "",
        municipality: "",
        province: "",
        country: "Angola",
      });
    }
  }, [customerToEdit, open, form, authCompanyId]);

  const handleSubmit = async (data: GrossCustomerInput) => {
    try {
      if (customerToEdit?.id) {
        // Para edição, manter a lógica atual
        await updateCustomer.mutateAsync({
          id: customerToEdit.id,
          cod: data.cod,
          name: data.name,
          taxName: data.taxName,
          nif: data.nif,
        } );
      } else {
        const storeCompanyId = useAuthStore.getState().companyId;
        const userDataCompanyId = useAuthStore.getState().userData?.companyId;
        const currentCompanyId = storeCompanyId || userDataCompanyId || authCompanyId || "";
        
        if (!currentCompanyId) {
          toast.error("Erro: ID da empresa não encontrado. Tente recarregar a página.");
          return;
        }
        
        const customerData = {
          cod: data.cod,
          name: data.name,
          taxName: data.taxName,
          nif: data.nif,
          companyId: currentCompanyId,
        };
        
        const grossPayload = {
          ...customerData,
          customer: customerData,
          ...(data.email || data.phone ? {
            contact: {
              companyId: currentCompanyId,
              email: data.email || undefined,
              phoneNumbers: data.phone ? [{ phone: data.phone }] : undefined,
            }
          } : {}),
          ...(data.houseHold || data.commune || data.municipality || data.province || data.country ? {
            address: {
              houseHold: data.houseHold || "",
              commune: data.commune || "",
              municipality: data.municipality || "",
              province: data.province || "",
              country: data.country || "Angola",
              companyId: currentCompanyId,
            }
          } : {}),
        };

        await createGrossCustomer.mutateAsync(grossPayload);
      }
      onOpenChange(false);
      toast.success(isEditing ? t("toasts.updateSuccess") : t("toasts.createSuccess"));
    } catch {
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
            onSubmit={form.handleSubmit(handleSubmit, () => {
              toast.error("Por favor, preencha todos os campos obrigatórios");
            })}
            className="flex flex-col"
          >
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            
              <div>
               
                <div className="grid gap-4 md:grid-cols-2">
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
             
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="exemplo@email.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="+244 000 000 000"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
               
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="houseHold"
                    render={({ field }) => (
                      <FormItem >
                        <FormLabel>Domicílio</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: Casa 123, Rua X"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Angola"
                            readOnly
                            className="bg-gray-50 cursor-not-allowed"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Província</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("municipality", "");
                              form.setValue("commune", "");
                            }}
                            disabled={loadingProvinces || isSaving}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  loadingProvinces
                                    ? "Carregando províncias..."
                                    : "Selecione uma província"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {provincesData.map((province) => (
                                <SelectItem
                                  key={province.slug || province.name}
                                  value={province.name}
                                >
                                  {province.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="municipality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Município</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("commune", "");
                            }}
                            disabled={municipalities.length === 0 || isSaving}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  loadingProvinces
                                    ? "Carregando municípios..."
                                    : municipalities.length === 0
                                    ? "Selecione a província"
                                    : "Selecione um município"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {municipalities.map((municipality) => (
                                <SelectItem
                                  key={municipality.slug || municipality.name}
                                  value={municipality.name}
                                >
                                  {municipality.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="commune"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comuna</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={communes.length === 0 || isSaving}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  selectedMunicipality
                                    ? communes.length === 0
                                      ? "Sem comunas disponíveis"
                                      : "Selecione uma comuna"
                                    : "Selecione o município"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {communes.map((commune) => (
                                <SelectItem
                                  key={commune.slug || commune.name}
                                  value={commune.name}
                                >
                                  {commune.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 "
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="shadow-lg  px-6"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon("save")}...
                  </>
                ) : (
                  isEditing ? tCommon("save") : "Criar Cliente"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}