"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEmployeeSchema } from "@/infrastructure/schema/schema-employees";
import { z } from "zod";
import {
  useCreateEmployee,
  useUpdateEmployee,
} from "@/infrastructure/hooks/useEmployees";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { ContactSelect } from "@/components/common/base-ui/selects/contact-select";
import { DepartmentSelect } from "@/components/common/base-ui/selects/department-select";
import { SiteSelect } from "@/components/common/base-ui/selects/site-select";
import { AddressSelect } from "@/components/common/base-ui/selects/address-select";
import { RoleSelect } from "@/components/common/base-ui/selects/role-select";

type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

interface EmployeesCreatePageProps {
  id?: string;
  initialData?: Partial<CreateEmployeeInput> & { id?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EmployeesCreatePage(props: EmployeesCreatePageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const companyId = useAuthStore((s) => s.companyId) ?? "";
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

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
      roleId: "",
    },
  });

  React.useEffect(() => {
    const d = props.initialData;
    if (!d) return;
    form.reset({
      companyId: d.companyId || companyId,
      fullName: d.fullName || "",
      photo: d.photo || "",
      contactId: d.contactId || "",
      addressId: d.addressId || "",
      siteId: (d as any).siteId ?? undefined,
      departmentId: d.departmentId || "",
      cod: d.cod || "",
      roleId: (d as any).roleId || "",
    });
  }, [props.initialData, form, companyId]);


  const onSubmit = async (data: CreateEmployeeInput) => {
    try {
      setIsSubmitting(true);
      if (props.id) {
        const { companyId: _omit, ...updateOnly } = (data as any) || {};
        await updateEmployee.mutateAsync({ id: props.id as string, data: updateOnly });
        toast.success("Funcionário atualizado com sucesso!");
      } else {
        const createPayload: any = { ...data, companyId: (data as any).companyId || companyId };
        await (createEmployee.mutateAsync as (vars: CreateEmployeeInput) => Promise<unknown>)(createPayload);
        toast.success("Funcionário criado com sucesso!");
      }
      if (props.onSuccess) props.onSuccess();
      else form.reset();
    } catch (error) {
      toast.error("Erro ao salvar funcionário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Novo Funcionário</h1>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="py-4 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
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
               Nº Mec *
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
            <div className="space-y-2">
              <Label htmlFor="roleId" className="text-slate-700">
               Função *
              </Label>
              <RoleSelect
                value={form.watch("roleId")}
                onChange={(value) => form.setValue("roleId", value)}
                companyId={companyId}
              />
              {form.formState.errors.roleId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.roleId.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                props.onCancel ? props.onCancel() : router.back()
              }
              className="rounded-lg px-6 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                createEmployee.isPending ||
                updateEmployee.isPending
              }
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6"
            >
              {isSubmitting ||
              createEmployee.isPending ||
              updateEmployee.isPending
                ? "Salvando..."
                : props.id
                ? "Atualizar Funcionário"
                : "Criar Funcionário"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
