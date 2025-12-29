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
import { useSiteById } from "@/infrastructure/hooks/useSites";
import { toast } from "sonner";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { ContactSelect } from "@/components/common/base-ui/selects/contact-select";
import { DepartmentSelect } from "@/components/common/base-ui/selects/department-select";
import { SiteSelect } from "@/components/common/base-ui/selects/site-select";
import { AddressSelect } from "@/components/common/base-ui/selects/address-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Employee } from "@/infrastructure/types/domain";

type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeToEdit?: Employee;
  onSuccess?: () => void;
  siteId?: string;
  isSiteLocked?: boolean;
}

import { useTranslations } from "next-intl";

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
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee()

  const form = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      companyId: companyId || "",
      fullName: "",
      photo: "",
      contactId: "",
      addressId: "",
      siteId: siteId || undefined,
      departmentId: "",
      cod: "",
      function: "",
    },
  });

  const selectedSiteId = form.watch("siteId");
  const { data: selectedSite } = useSiteById(selectedSiteId, { enabled: !!selectedSiteId });

  const isLimitReached = React.useMemo(() => {
    if (!selectedSite || !selectedSite.numberWorkersContract) return false;
    const currentWorkers = selectedSite.employees?.length || 0;

    const isEditingInSameSite = employeeToEdit?.id && employeeToEdit?.siteId === selectedSiteId;
    const adjustCount = isEditingInSameSite ? -1 : 0;

    return (currentWorkers + adjustCount) >= selectedSite.numberWorkersContract;
  }, [selectedSite, employeeToEdit, selectedSiteId]);

  React.useEffect(() => {
    if (open) {
      if (employeeToEdit) {
        form.reset({
          companyId: employeeToEdit.companyId || companyId,
          fullName: employeeToEdit.fullName || "",
          photo: employeeToEdit.photo || "",
          contactId: employeeToEdit.contactId || "",
          addressId: employeeToEdit.addressId || "",
          siteId: employeeToEdit.siteId ?? siteId ?? undefined,
          departmentId: employeeToEdit.departmentId || "",
          cod: employeeToEdit.cod || "",
          function: employeeToEdit.function || "",
        });
      } else {
        form.reset({
          companyId: companyId,
          fullName: "",
          photo: "",
          contactId: "",
          addressId: "",
          siteId: siteId || undefined,
          departmentId: "",
          cod: "",
          function: "",
        });
      }
    }
  }, [employeeToEdit, form, companyId, open, siteId]);

  const onSubmit = async (data: CreateEmployeeInput) => {
    try {
      if (isLimitReached) {
        toast.error(t("toasts.limitReached"));
        return;
      }
      setIsSubmitting(true);
      if (employeeToEdit?.id) {
        const { companyId: _omit, ...updateOnly } = (data as any) || {};
        await updateEmployee.mutateAsync({
          id: employeeToEdit.id,
          ...updateOnly,
        });
        toast.success(t("toasts.updateSuccess"));
      } else {
        const currentCompanyId = companyId || useAuthStore.getState().companyId || "";
        const createPayload: any = {
          ...data,
          companyId: (data as any).companyId || currentCompanyId,
        };
        await createEmployee.mutateAsync(createPayload);
        toast.success(t("toasts.createSuccess"));
      }
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(t("toasts.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = isSubmitting || createEmployee.isPending || updateEmployee.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden dark:bg-slate-950">
        <DialogHeader className="pt-6 px-6 pb-2 border-b border-gray-100 bg-white dark:bg-slate-900/50">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {employeeToEdit ? t("title.edit") : t("title.create")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          if (errors.companyId) {
            toast.error("Erro na identificação da empresa. Tente recarregar a página.");
          }
        })} className="flex flex-col">
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fullName" className="text-slate-700 font-medium">
                  {t("fields.fullName")} *
                </Label>
                <Input
                  id="fullName"
                  {...form.register("fullName")}
                  placeholder={t("placeholders.fullName")}
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
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
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
                {form.formState.errors.cod && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.cod.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactId" className="text-slate-700 font-medium">
                  {t("fields.contact")} *
                </Label>
                <ContactSelect
                  value={form.watch("contactId")}
                  onChange={(v) => form.setValue("contactId", v)}
                  companyId={companyId}
                />
                {form.formState.errors.contactId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.contactId.message}
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
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
                {form.formState.errors.roleId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.roleId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteId" className="text-slate-700 font-medium">
                  {t("fields.site")} *
                </Label>
                <div className="flex gap-2">
                  <SiteSelect
                    value={form.watch("siteId")}
                    onChange={(value) => form.setValue("siteId", value)}
                    disabled={isSiteLocked}
                  />
                </div>
                {form.formState.errors.siteId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.siteId.message}
                  </p>
                )}
              </div>

              {isLimitReached && (
                <div className="md:col-span-2">
                  <div className="p-3 text-sm text-amber-600 bg-amber-50 rounded-lg border border-amber-200 w-full">
                    {t("limitReachedWarning", { limit: selectedSite?.numberWorkersContract || 0 })}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="departmentId" className="text-slate-700 font-medium">
                  {t("fields.department")} *
                </Label>
                <div className="flex gap-2">
                  <DepartmentSelect
                    value={form.watch("departmentId")}
                    onChange={(value) => form.setValue("departmentId", value)}
                    companyId={companyId}
                  />
                </div>
                {form.formState.errors.departmentId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.departmentId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressId" className="text-slate-700 font-medium">
                  {t("fields.address")} *
                </Label>
                <div className="flex gap-2">
                  <AddressSelect
                    value={form.watch("addressId")}
                    onChange={(value) => form.setValue("addressId", value)}
                    companyId={companyId}
                  />
                </div>
                {form.formState.errors.addressId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.addressId.message}
                  </p>
                )}
              </div>

            </div>

          </div>

          <DialogFooter className="mr-6 p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="shadow-lg rounded-xl px-6"
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
