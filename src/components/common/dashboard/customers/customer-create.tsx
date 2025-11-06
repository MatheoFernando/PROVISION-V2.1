"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCustomerSchema,
  CreateCustomerPayload,
} from "@/infrastructure/schema/schema-customers";
import { useCreateCustomer, useUpdateCustomer } from "@/infrastructure/hooks/useCustomers";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { AddressSelect } from "@/components/common/base-ui/selects/address-select";
import { ContactSelect } from "@/components/common/base-ui/selects/contact-select";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";

interface CustomersCreatePageProps {
  id?: string;
  initialData?: CreateCustomerPayload & { id?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

function CustomersCreatePage(props: CustomersCreatePageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");

  const router = useRouter();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const companyId = useAuthStore((state) => state.companyId) || "";
  const form = useForm({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      cod: "",
      name: "",
      taxName: "",
      nif: "",
      photo: "",
      contactId: "",
      addressId: "",
      companyId: companyId,
    },
  });

  React.useEffect(() => {
    const d = props.initialData;
    if (!d) return;
    form.reset({
      cod: d.cod || "",
      name: d.name || "",
      taxName: d.taxName || "",
      nif: d.nif || "",
      photo: d.photo || "",
      contactId: d.contactId || "",
      addressId: d.addressId || "",
      companyId: d.companyId || companyId,
    });
  }, [props.initialData, form, companyId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        form.setValue("photo", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateCustomerPayload) => {
    console.log("onSubmit chamado com dados:", data);
    setIsSubmitting(true);
    try {
      if (props.id) {
        await updateCustomer.mutateAsync({ id: props.id, data: { ...data, companyId } as any });
      } else {
        await createCustomer.mutateAsync({
          ...data,
          companyId,
        });
      }
      if (props.onSuccess) props.onSuccess(); else router.back();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

      <div>
          <h1 className="text-3xl font-bold text-slate-900">Novo Cliente</h1>
      
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className=" p-4 space-y-6">
           
{/*
  <div className="bg-slate-400 p-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-white shadow-lg overflow-hidden border-4 border-white">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <Upload className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="photo-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-white text-sm mt-3">
                  Clique para fazer upload da foto
                </p>
              </div>
            </div>
             */}
           
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cod" className="text-slate-700">
                      Código *
                    </Label>
                    <Input
                      id="cod"
                      {...form.register("cod")}
                      placeholder="Digite o código"
                      className="rounded-lg"
                    />
                    {form.formState.errors.cod && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.cod.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">
                      Nome *
                    </Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Digite o nome"
                      className="rounded-lg"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxName" className="text-slate-700">
                      Nome Fiscal *
                    </Label>
                    <Input
                      id="taxName"
                      {...form.register("taxName")}
                      placeholder="Digite o nome fiscal"
                      className="rounded-lg"
                    />
                    {form.formState.errors.taxName && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.taxName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nif" className="text-slate-700">
                      NIF *
                    </Label>
                    <Input
                      id="nif"
                      {...form.register("nif")}
                      placeholder="Digite o NIF"
                      className="rounded-lg"
                    />
                    {form.formState.errors.nif && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.nif.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="space-y-2">
                      <Label htmlFor="contactId" className="text-slate-700">
                        Selecione o Contato *
                      </Label>
                      <ContactSelect
                        value={form.watch("contactId")}
                        onChange={(value) => {
                          form.setValue("contactId", value, {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true,
                          });
                        }}
                        companyId={companyId}
                      />
                      {form.formState.errors.contactId && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.contactId.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="space-y-2">
                      <Label htmlFor="addressId" className="text-slate-700">
                        Selecione o Endereço *
                      </Label>
                      <AddressSelect
                        value={form.watch("addressId")}
                        onChange={(value) => {
                          form.setValue("addressId", value, {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true,
                          });
                        }}
                        companyId={companyId}
                      />
                      {form.formState.errors.addressId && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.addressId.message}
                        </p>
                      )}
                    </div>
                  
              </div>
            </div>

            <div className=" flex justify-end gap-3 ">
              <Button
                type="button"
                variant="outline"
                onClick={() => (props.onCancel ? props.onCancel() : router.back())}
                className="rounded-lg px-6 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || updateCustomer.isPending || createCustomer.isPending}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6"
              >
                {isSubmitting || updateCustomer.isPending || createCustomer.isPending ? "Salvando..." : props.id ? "Atualizar Cliente" : "Criar Cliente"}
              </Button>
            </div>
          </div>
        </form>
      </div>
  
  );
}

export default CustomersCreatePage;
