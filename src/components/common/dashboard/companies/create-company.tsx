"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Upload, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/infrastructure/utils/api";
import { companySchema } from "@/infrastructure/schema/schema-company";
import { z } from "zod";
import type { Company } from "@/infrastructure/types/domain";
import {
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
} from "@/infrastructure/hooks/useCompanies";
import { useCreateUser } from "../../../../infrastructure/hooks/useUsers";
import {
  useAngolaCountry,
  useAngolaProvinces,
} from "@/infrastructure/hooks/useAngolaLocations";
import { PhoneField } from "@/components/common/base-ui/phone-field";
import Image from "next/image";

function CompanyFormPage() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id") ?? undefined;
  const isEditing = useMemo(() => !!id, [id]);
  const [showPassword, setShowPassword] = useState(false);
  
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
      admin: isEditing ? undefined : {
        phone: "",
        password: "",
      },
    },
  });

  const { mutateAsync: createAsync, isPending: creating } =
    useCreateCompanyMutation();
  const { mutateAsync: updateAsync, isPending: updating } =
    useUpdateCompanyMutation();
  const { mutateAsync: createUserAsync, isPending: creatingUser } =
    useCreateUser({ showToast: false });

  const { data: angolaCountry } = useAngolaCountry();
  const {
    data: provincesData = [],
    isPending: loadingProvinces,
  } = useAngolaProvinces();

  const provinceValue = form.watch("address.province");
  const municipalityValue = form.watch("address.municipality");

  const selectedProvince = useMemo(
    () =>
      provincesData.find((province) => province.name === provinceValue) ?? null,
    [provincesData, provinceValue]
  );

  const municipalities = useMemo(
    () => selectedProvince?.municipalities ?? [],
    [selectedProvince]
  );

  const selectedMunicipality = useMemo(
    () =>
      municipalities.find(
        (municipality) => municipality.name === municipalityValue
      ) ?? null,
    [municipalities, municipalityValue]
  );

  const communes = selectedMunicipality?.communes ?? [];

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
    const ec = existingCompany 
    const primaryAddress = ec?.address ?? {
      houseHold: "",
      commune: "",
      municipality: "",
      province: "",
      country: "",
    }
    const primaryContact = ec?.contact ?? { email: "", phoneNumbers: [] }

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

  useEffect(() => {
    if (angolaCountry && !form.getValues("address.country")) {
      form.setValue("address.country", angolaCountry.name);
    }
  }, [angolaCountry, form]);

  const onSubmit = async (values: z.infer<typeof companySchema>) => {
    try {
      if (isEditing) {
        await updateAsync({
          id: values.id!,
          taxName: values.taxName ?? "",
          businessName: values.businessName ?? "",
          photo: values.photo,
          contactId: values.contactId,
          addressId: values.addressId,
          status: values.status ?? true,
          hasExistedSince: values.hasExistedSince,
          contact: {
            email: values.contact?.email ?? "",
            phoneNumbers: values.contact?.phoneNumbers ?? [],
          },
          address: {
            houseHold: values.address?.houseHold ?? "",
            commune: values.address?.commune ?? "",
            municipality: values.address?.municipality ?? "",
            province: values.address?.province ?? "",
            country: values.address?.country ?? "",
          },
        });
        toast.success("Empresa atualizada com sucesso");
      } else {
        const companyResponse = await createAsync({
          cod: values.cod ?? "",
          taxName: values.taxName ?? "",
          businessName: values.businessName ?? "",
          nif: values.nif ?? "",
          photo: values.photo,
          status: values.status ?? true,
          hasExistedSince: new Date().toISOString(),
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

        // Criar o administrador da empresa
        if (values.admin?.phone && values.admin?.password && companyResponse?.data?.id) {
          try {
            await createUserAsync({
              phone: values.admin.phone,
              password: values.admin.password,
              isGlobalAdmin: false,
              status: true,
              companyId: companyResponse.data.id,
            });
            toast.success("Empresa e administrador criados com sucesso");
          } catch (userError) {
            toast.warning("Empresa criada, mas houve erro ao criar o administrador");
            console.error("Erro ao criar administrador:", userError);
          }
        } else {
          toast.success("Empresa criada com sucesso");
        }
      }

      const shouldReturnToUserCreate = sessionStorage.getItem('returnToUserCreate');
      if (shouldReturnToUserCreate === 'true') {
        sessionStorage.removeItem('returnToUserCreate');
        router.push('/dashboard/configuracoes/utilizadores-permissoes');
      } else {
        router.back();
      }
    } catch (error) {
      toast.error("Ocorreu um erro. Tente novamente.");
    }
  };

  const saving = creating || updating || creatingUser;
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
                <div className="lg:col-span-1 gap-4">
                  <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="mt-2">
                            {photoValue ? (
                              <div className="relative aspect-square w-full h-60 rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50">
                                <Image
                                  src={photoValue}
                                  alt="Logo"
                                  width={176}
                                  height={176}
                                  className="w-44 h-60 object-contain text-center mx-auto"
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

                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-10 gap-4">
                      {!isEditing && (
                        <div className="md:col-span-3">
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
                        </div>
                      )}

                      <div className={!isEditing ? "md:col-span-7" : "md:col-span-10"}>
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700">
                                Nome da Empresa
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Empresa"
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

                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-10 gap-4">
                      <div className="md:col-span-7">
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
                                  placeholder="Nome Fiscal"
                                  className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name="nif"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700">
                                NIF
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="NIF"
                                  className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                                  disabled={isEditing}
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
                   
                    <FormField
                      control={form.control}
                      name="address.houseHold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">
                            Morada
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Morada completa"
                              className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  <div className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                              <PhoneField
                                value={field.value ?? ""}
                                onChange={(value) => field.onChange(value ?? "")}
                                onBlur={field.onBlur}
                                placeholder="999 999 999"
                                required
                                className="h-9 "
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
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900 w-full">
                                  <SelectValue placeholder="Selecione o país" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[angolaCountry]
                                  .filter(Boolean)
                                  .map((country) => (
                                    <SelectItem
                                      key={country!.slug || country!.name}
                                      value={country!.name}
                                    >
                                      {country!.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
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
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue("address.municipality", "", {
                                  shouldValidate: true,
                                });
                                form.setValue("address.commune", "", {
                                  shouldValidate: true,
                                });
                              }}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900 w-full"
                                  disabled={loadingProvinces}
                                >
                                  <SelectValue
                                    placeholder={
                                      loadingProvinces
                                        ? "Carregando províncias..."
                                        : "Selecione a província"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
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
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue("address.commune", "", {
                                  shouldValidate: true,
                                });
                              }}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900 w-full"
                                  disabled={municipalities.length === 0}
                                >
                                  <SelectValue
                                    placeholder={
                                      loadingProvinces
                                        ? "Carregando municípios..."
                                        : municipalities.length === 0
                                          ? "Selecione a província"
                                          : "Selecione o município"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.commune"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Comuna
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900 w-full"
                                  disabled={communes.length === 0}
                                >
                                  <SelectValue
                                    placeholder={
                                      municipalities.length === 0
                                        ? "Selecione o município"
                                        : communes.length === 0
                                          ? "Sem comunas disponíveis"
                                          : "Selecione a comuna"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    </div>
                    {!isEditing && (
                <div className=" mt-6 border shadow p-4 rounded-lg bg-gray-50">
                  <div className=" py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">
                     Administrador da empresa
                    </h2>
                  
                  </div>

                  <div className="my-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="admin.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Telefone do Administrador *
                            </FormLabel>
                            <FormControl>
                              <PhoneField
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                        <FormField
                        control={form.control}
                        name="admin.password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Senha do Administrador *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Senha"
                                  className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900 pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

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
                  className=" px-6 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A guardar...
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
