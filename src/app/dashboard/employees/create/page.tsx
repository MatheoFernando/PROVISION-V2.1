"use client";

import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEmployeeSchema } from "@/infrastructure/schema/schema-employees";
import { z } from "zod";
import { useCreateEmployee } from "@/infrastructure/hooks/useEmployees";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { ContactSelect } from "@/components/common/base-ui/selects/contact-select";
import { DepartmentSelect } from "@/components/common/base-ui/selects/department-select";
import { SiteSelect } from "@/components/common/base-ui/selects/site-select";
import { AddressSelect } from "@/components/common/base-ui/selects/address-select";

type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export default function EmployeesCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");

  const companyId = useAuthStore((s) => s.companyId) ?? "";

  const createEmployee = useCreateEmployee();

  const form = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      companyId,
      fullName: "",
      photo: "",
      contactId: "",
      addressId: "",
      siteId: undefined,
      departmentId: "",
      cod: "",
      function: "",
    },
  });

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

  const onSubmit = async (data: CreateEmployeeInput) => {
    try {
      setIsSubmitting(true);
      await (
        createEmployee.mutateAsync as (
          vars: CreateEmployeeInput
        ) => Promise<unknown>
      )(data);
      toast.success("Funcionário criado com sucesso!");
      router.push("/dashboard/employees");
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar funcionário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Novo Funcionário
          </h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/*
            <div className="bg-blue-400 p-6">
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
                        <User className="w-6 h-6 text-slate-400" />
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

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700">
                    Nome Completo *
                  </Label>
                  <Input
                    id="fullName"
                    {...form.register("fullName")}
                    placeholder="Digite o nome completo"
                    className="rounded-lg"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700">
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
                  <Label htmlFor="function" className="text-slate-700">
                    Função *
                  </Label>
                  <Input
                    id="function"
                    {...form.register("function")}
                    placeholder="Digite a função"
                    className="rounded-lg"
                  />
                  {form.formState.errors.function && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.function.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactId" className="text-slate-700">
                    Contato *
                  </Label>
                  <ContactSelect
                    value={form.watch("contactId")}
                    onChange={(v) => form.setValue("contactId", v)}
                    companyId={companyId}
                  />
                  {form.formState.errors.contactId && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.contactId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteId" className="text-slate-700">
                    Site *
                  </Label>
                  <div className="flex gap-2">
                    <SiteSelect
                      value={form.watch("siteId")}
                      onChange={(value) => form.setValue("siteId", value)}
                    />
                  </div>
                  {form.formState.errors.siteId && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.siteId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departmentId" className="text-slate-700">
                    Departamento *
                  </Label>
                  <div className="flex gap-2">
                    <DepartmentSelect
                      value={form.watch("departmentId")}
                      onChange={(value) => form.setValue("departmentId", value)}
                      companyId={companyId}
                    />
                  </div>
                  {form.formState.errors.departmentId && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.departmentId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departmentId" className="text-slate-700">
                    Endereço *
                  </Label>
                  <div className="flex gap-2">
                    <AddressSelect
                      value={form.watch("addressId")}
                      onChange={(value) => form.setValue("addressId", value)}
                      companyId={companyId}
                    />
                  </div>
                  {form.formState.errors.addressId && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.addressId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="bg-slate-50 px-8 py-4 flex justify-end gap-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="rounded-lg px-6 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6"
              >
                {isSubmitting ? "Salvando..." : "Criar Funcionário"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
