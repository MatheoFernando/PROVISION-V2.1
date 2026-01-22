"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateGrossEmployee,
  useUpdateEmployee,
} from "@/infrastructure/hooks/useEmployees";
import { toast } from "sonner";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useAngolaProvinces } from "@/infrastructure/hooks/useAngolaLocations";
import { useDepartmentsByCompanyId } from "@/infrastructure/hooks/useDepartments";
import { useSites } from "@/infrastructure/hooks/useSites";
import { SiteSelect } from "@/components/common/base-ui/selects/site-select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Employee } from "@/infrastructure/types/domain";

const grossEmployeeSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  companyId: z.string().optional().or(z.literal("")),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  photo: z.string().optional().or(z.literal("")),
  function: z.string().min(1, "Função é obrigatória"),
  nameSite: z.string().optional().or(z.literal("")),
  siteId: z.string().optional().or(z.literal("")),
  departmentId: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  houseHold: z.string().optional().or(z.literal("")),
  commune: z.string().optional().or(z.literal("")),
  municipality: z.string().optional().or(z.literal("")),
  province: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
});

type GrossEmployeeInput = z.infer<typeof grossEmployeeSchema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeToEdit?: Employee;
  onSuccess?: () => void;
  siteId?: string;
  isSiteLocked?: boolean;
}

import { useTranslations } from "next-intl";
import { DepartmentSelect } from "@/components/common/base-ui/selects/department-select";

export function EmployeeDialog({
  open,
  onOpenChange,
  employeeToEdit,
  onSuccess,
  siteId,
  isSiteLocked,
}: EmployeeDialogProps) {
  const t = useTranslations("Employees");
  const tCommon = useTranslations("Common");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const companyId = useAuthStore((s) => s.companyId) ?? "";
  const createGrossEmployee = useCreateGrossEmployee();
  const updateEmployee = useUpdateEmployee();
  const { data: departments = [] } = useDepartmentsByCompanyId(companyId);
  const { data: sites = [] } = useSites(undefined, { companyId: companyId });

  const form = useForm<GrossEmployeeInput>({
    resolver: zodResolver(grossEmployeeSchema),
    defaultValues: {
      companyId: companyId || "",
      fullName: "",
      photo: "",
      cod: "",
      function: "",
      nameSite: "",
      siteId: "",
      departmentId: "",
      email: "",
      phone: "",
      houseHold: "",
      commune: "",
      municipality: "",
      province: "",
      country: "Angola",
    },
  });

  // Lógica de seleção encadeada de endereços (Angola)
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

  React.useEffect(() => {
    if (open) {
      if (employeeToEdit) {
        form.reset({
          companyId: employeeToEdit.companyId || companyId,
          fullName: employeeToEdit.fullName || "",
          photo: employeeToEdit.photo || "",
          cod: employeeToEdit.cod || "",
          function: employeeToEdit.function || "",
          nameSite: employeeToEdit.site?.name || "",
          siteId: employeeToEdit.siteId || "",
          departmentId: employeeToEdit.departmentId || "",
          email: employeeToEdit.contact?.email || "",
          phone: employeeToEdit.contact?.phoneNumbers?.[0]?.phone || "",
          houseHold: employeeToEdit.address?.houseHold || "",
          commune: employeeToEdit.address?.commune || "",
          municipality: employeeToEdit.address?.municipality || "",
          province: employeeToEdit.address?.province || "",
          country: employeeToEdit.address?.country || "",
        });
      } else {
        form.reset({
          companyId: companyId,
          fullName: "",
          photo: "",
          cod: "",
          function: "",
          nameSite: "",
          siteId: "",
          departmentId: "",
          email: "",
          phone: "",
          houseHold: "",
          commune: "",
          municipality: "",
          province: "",
          country: "Angola",
        });
      }
    }
  }, [employeeToEdit, form, companyId, open]);

  const onSubmit = async (data: GrossEmployeeInput) => {
    try {
      setIsSubmitting(true);
      if (employeeToEdit?.id) {
        const { companyId: _omit, ...updateOnly } = data;
        await updateEmployee.mutateAsync({
          id: employeeToEdit.id,
          ...updateOnly,
        });
        toast.success(t("toasts.updateSuccess"));
      } else {
        const currentCompanyId = companyId || useAuthStore.getState().companyId || "";
        
        if (!currentCompanyId) {
          toast.error("Erro: ID da empresa não encontrado. Tente recarregar a página.");
          setIsSubmitting(false);
          return;
        }
        
        const selectedDepartment = departments.find(d => d.id === data.departmentId);
        const departmentName = selectedDepartment?.name || "";

        const selectedSite = sites.find(s => s.id === data.siteId);
        const siteName = selectedSite?.name || data.nameSite || "";

        
        const grossPayload = {
          cod: data.cod,
          companyId: currentCompanyId,
          fullName: data.fullName,
          photo: data.photo || "",
          function: data.function,
          nameSite: siteName,
          nameDepartment: departmentName,
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

        await createGrossEmployee.mutateAsync(grossPayload);
        toast.success(t("toasts.createSuccess"));
      }
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = 
        (error as { response?: { data?: { message?: string; data?: string } } })?.response?.data?.message ||
        (error as { response?: { data?: { message?: string; data?: string } } })?.response?.data?.data ||
        (error as { message?: string })?.message ||
        t("toasts.error");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = isSubmitting || createGrossEmployee.isPending || updateEmployee.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden dark:bg-slate-950">
        <DialogHeader className="pt-6 px-6 pb-2 border-b border-gray-100 bg-white dark:bg-slate-900/50">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {employeeToEdit ? t("title.edit") : t("title.create")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, () => {
          toast.error("Por favor, preencha todos os campos obrigatórios");
        })} className="flex flex-col">
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
         
            <div>
             
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fullName" className="text-slate-700 font-medium">
                    {t("fields.fullName")} *
                  </Label>
                  <Input
                    id="fullName"
                    {...form.register("fullName")}
                    placeholder={t("placeholders.fullName")}
                    className=" border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-red-500 font-medium">
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cod" className="text-slate-700 font-medium">
                    {t("fields.cod")} *
                  </Label>
                  <Input
                    id="cod"
                    {...form.register("cod")}
                    placeholder={t("placeholders.cod")}
                    className=" border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                  {form.formState.errors.cod && (
                    <p className="text-sm text-red-500 font-medium">
                      {form.formState.errors.cod.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="function" className="text-slate-700 font-medium">
                    {t("fields.function")} *
                  </Label>
                  <Input
                    id="function"
                    {...form.register("function")}
                    placeholder={t("placeholders.function")}
                    className=" border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                  {form.formState.errors.function && (
                    <p className="text-sm text-red-500 font-medium">
                      {form.formState.errors.function.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteId" className="text-slate-700 font-medium">
                    Nome do Site
                  </Label>
                  <SiteSelect 
                    value={form.watch("siteId")}
                    onChange={(value) => form.setValue("siteId", value)}
                    companyId={companyId}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departmentId" className="text-slate-700 font-medium">
                    Departamento
                  </Label>
                  <DepartmentSelect
                    value={form.watch("departmentId")}
                    onChange={(value) => form.setValue("departmentId", value)}
                    companyId={companyId}
                  />
                </div>
              </div>
            </div>

         
            <div>
           
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="exemplo@email.com"
                    className=" border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500 font-medium">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    type="number"
                    {...form.register("phone")}
                    placeholder="+244 000 000 000"
                    className=" border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                </div>
              </div>
            </div>

         
            <div>
             
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 ">
                  <Label htmlFor="houseHold" className="text-slate-700 font-medium">
                    Domicílio
                  </Label>
                  <Input
                    id="houseHold"
                    {...form.register("houseHold")}
                    placeholder="Ex: Casa 123, Rua X"
                    className=" border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-slate-700 font-medium">
                    País
                  </Label>
                  <Input
                    id="country"
                    {...form.register("country")}
                    placeholder="Ex: Angola"
                    readOnly
                    className="bg-gray-50 cursor-not-allowed border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province" className="text-slate-700 font-medium">
                    Província
                  </Label>
                  <Select
                    value={form.watch("province")}
                    onValueChange={(value) => {
                      form.setValue("province", value);
                      form.setValue("municipality", "");
                      form.setValue("commune", "");
                    }}
                    disabled={loadingProvinces || isPending}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipality" className="text-slate-700 font-medium">
                    Município
                  </Label>
                  <Select
                    value={form.watch("municipality")}
                    onValueChange={(value) => {
                      form.setValue("municipality", value);
                      form.setValue("commune", "");
                    }}
                    disabled={municipalities.length === 0 || isPending}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commune" className="text-slate-700 font-medium">
                    Comuna
                  </Label>
                  <Select
                    value={form.watch("commune")}
                    onValueChange={(value) => form.setValue("commune", value)}
                    disabled={communes.length === 0 || isPending}
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
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mr-6 p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 "
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="shadow-lg px-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tCommon("save")}...
                </>
              ) : employeeToEdit ? (
                tCommon("save")
              ) : (
                tCommon("create")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}
