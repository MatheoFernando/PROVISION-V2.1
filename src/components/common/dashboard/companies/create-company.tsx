"use client";

import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/infrastructure/utils/api";
import { companySchema } from "@/infrastructure/schema/schema-company";
import { z } from "zod";
import type { Company } from "@/infrastructure/types/domain";
import {
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
} from "@/infrastructure/hooks/useCompanies";

function CompanyFormPage() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id") ?? undefined;
  const form = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      id,
      photo: "",
      cod: "",
      businessName: "",
      taxName: "",
      nif: "",
      status: true,
      hasExistedSince: undefined,
      contactId: undefined,
      addressId: undefined,
      contact: { phoneNumbers: [{ phone: "" }], email: "" },
      address: {
        houseHold: "",
        commune: "",
        municipality: "",
        province: "",
        country: "",
      },
    },
  });

  const { mutateAsync: createAsync, isPending: creating } =
    useCreateCompanyMutation();
  const { mutateAsync: updateAsync, isPending: updating } =
    useUpdateCompanyMutation();

  const isEditing = useMemo(() => !!id, [id]);

  const { data: companies, isLoading: loadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: async (): Promise<Company[]> => {
      const response = await api.get("/company");
      const listSchema = z.array(companySchema);
      const parsed = listSchema.safeParse(response.data);
      if (!parsed.success) throw new Error("Erro ao carregar as empresas");
      return parsed.data as Company[];
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const existingCompany = useMemo(
    () => companies?.find((c) => c.id === id),
    [companies, id]
  );

  useEffect(() => {
    if (!existingCompany) return;
    const ec: any = existingCompany as any
    const primaryAddress = ec?.address ?? ec?.addresses?.[0] ?? {
      houseHold: "",
      commune: "",
      municipality: "",
      province: "",
      country: "",
    }
    const primaryContact = ec?.contact ?? ec?.contacts?.[0] ?? { email: "", phoneNumbers: [] }

    form.reset({
      id: existingCompany.id,
      cod: existingCompany.cod,
      businessName: existingCompany.businessName,
      taxName: existingCompany.taxName,
      nif: existingCompany.nif,
      status: existingCompany.status,
      photo: existingCompany.photo ?? "",
      hasExistedSince: existingCompany.hasExistedSince,
      contactId: existingCompany.contactId ?? undefined,
      addressId: existingCompany.addressId ?? undefined,
      contact: {
        email: primaryContact?.email ?? "",
        phoneNumbers: primaryContact?.phoneNumbers ?? [],
      },
      address: {
        houseHold: primaryAddress?.houseHold ?? "",
        commune: primaryAddress?.commune ?? "",
        municipality: primaryAddress?.municipality ?? "",
        province: primaryAddress?.province ?? "",
        country: primaryAddress?.country ?? "",
      },
    })
  }, [existingCompany, form]);

  const onSubmit = async (values: z.infer<typeof companySchema>) => {
    try {
      if (isEditing) {
        await updateAsync({
          id: values.id!,
          taxName: values.taxName ?? "",
          businessName: values.businessName ?? "",
          nif: values.nif ?? "",
          photo: values.photo,
          contactId: values.contactId,
          addressId: values.addressId,
          status: values.status ?? true,
          hasExistedSince: values.hasExistedSince,
        });
        toast.success("Empresa atualizada com sucesso");
      } else {
        await createAsync({
          cod: values.cod ?? "",
          taxName: values.taxName ?? "",
          businessName: values.businessName ?? "",
          nif: values.nif ?? "",
          photo: values.photo,
          status: values.status ?? true,
          hasExistedSince: values.hasExistedSince!,
          address: {
            houseHold: values.address?.houseHold ?? "",
            commune: values.address?.commune ?? "",
            municipality: values.address?.municipality ?? "",
            province: values.address?.province ?? "",
            country: values.address?.country ?? "",
          },
          contact: {
            email: values.contact?.email ?? "",
            phoneNumbers: values.contact?.phoneNumbers ?? [],
          },
        });
        toast.success("Empresa criada com sucesso");
      }
      router.back();
    } catch (error) {
      toast.error("Ocorreu um erro. Tente novamente.");
    }
  };

  const saving = creating || updating;
  const prefilling = isEditing && loadingCompanies && !existingCompany;
  const photoValue = form.watch("photo");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("photo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    form.setValue("photo", "");
  };

  return (
    <div className="min-h-screen  py-8 ">
      <div className="mx-auto max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 px-8 py-4">
            <h1 className="text-xl font-semibold text-slate-900">
              {isEditing ? "Editar Empresa" : "Nova Empresa"}
            </h1>
          </div>

          {prefilling && (
            <div className="mx-8 mt-6 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-4 text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando dados...
            </div>
          )}

          <Form {...form}>
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="mt-2">
                            {photoValue ? (
                              <div className="relative aspect-square w-full h-60 rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50">
                                <img
                                  src={photoValue}
                                  alt="Logo"
                                  className="w-44 h-44 object-contain text-center mx-auto"
                                />
                                <button
                                  type="button"
                                  onClick={removePhoto}
                                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-slate-100 transition-colors"
                                >
                                  <X className="h-4 w-4 text-red-500 cursor-pointer" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center md:h-44 lg:h-64 justify-center aspect-square w-full rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                <Upload className="h-10 w-10 text-slate-400 mb-2" />
                                <span className="text-sm text-slate-600 font-medium">
                                  Upload Logo
                                </span>
                                <span className="text-xs text-slate-500 mt-1">
                                  PNG, JPG até 5MB
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhotoChange}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!isEditing && (
                      <FormField
                        control={form.control}
                        name="cod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Código
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: EMP001"
                                className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem className={!isEditing ? "" : "md:col-span-2"}>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            Nome da Empresa
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome comercial"
                              className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                              {...field}
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
                          <FormLabel className="text-sm font-medium text-slate-700">
                            Nome Fiscal
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o nome fiscal"
                              className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nif"
                      disabled={isEditing}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            NIF
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o NIF"
                              className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasExistedSince"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            Data de Fundação
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                              value={
                                field.value ? field.value.substring(0, 10) : ""
                              }
                              onChange={(e) =>
                                field.onChange(
                                  new Date(e.target.value).toISOString()
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.houseHold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            Endereço Completo
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Rua, número, andar"
                              className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contact.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="contato@empresa.com"
                                className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contact.phoneNumbers.0.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Telefone
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="999 999 999"
                                type="number"
                                maxLength={9}
                                minLength={9}
                                pattern="[0-9]*"
                                title="Digite apenas números"
                                required
                                className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Província
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Província"
                                className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.municipality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Município
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Município"
                                className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2  gap-4">
                      <FormField
                        control={form.control}
                        name="address.commune"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Comuna
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Comuna"
                                className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              País
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="País"
                                className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className=" px-6 border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={saving}
                  onClick={form.handleSubmit(onSubmit)}
                  className=" px-6 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>Criar empresa</>
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default CompanyFormPage;
