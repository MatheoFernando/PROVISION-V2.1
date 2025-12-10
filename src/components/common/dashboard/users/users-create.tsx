"use client";

import React from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Phone,
  Lock,
  Building2,
  UserCog,
  Users,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useUsers } from "@/infrastructure/hooks/useUsers";
import type { User } from "@/infrastructure/types/domain";

import { CompanySelect } from "../../base-ui/selects/company-select";
import { DepartmentSelect } from "../../base-ui/selects/department-select";
import { RoleSelect } from "../../base-ui/selects/role-select";
import { userSchema } from "@/infrastructure/schema/schema-user";
import { z } from "zod";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import type {
  CreateUserPayload,
  UpdateUserPayload,
} from "@/infrastructure/types/domain";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PhoneField } from "@/components/common/base-ui/inputs/phone-field";
import { toast } from "sonner";

interface UserDialogProps {
  userToEdit?: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

import { useTranslations } from "next-intl";

export function UserDialog({
  userToEdit,
  open,
  onOpenChange,
  onSuccess,
}: UserDialogProps) {
  const t = useTranslations("Users");
  const tCommon = useTranslations("Common");
  const [showPassword, setShowPassword] = React.useState(false);

  const { createUser, updateUser, isCreating, isUpdating } = useUsers();
  const {
    companyId: authCompanyId,
    isGlobalAdmin: canGrantGlobalAdmin,
  } = useAuthStore();

  type UserFormSchema = z.infer<typeof userSchema>;

  const defaultValues = React.useMemo(
    () => ({
      id: userToEdit?.id,
      phone: userToEdit?.phone ?? "",
      password: "",
      isGlobalAdmin: userToEdit?.isGlobalAdmin ?? false,
      status: userToEdit?.status ?? true,
      companyId: userToEdit?.companyId ?? authCompanyId ?? "",
      departmentId:
        userToEdit?.departmentId ?? userToEdit?.employee?.departmentId ?? undefined,
      roleId: userToEdit?.roleId ?? "",
    }),
    [userToEdit, authCompanyId]
  );

  const form = useForm<UserFormSchema>({
    resolver: zodResolver(userSchema),
    defaultValues,
  });

  React.useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, open]);

  const onSubmit = async (data: UserFormSchema) => {
    const normalize = (value?: string | null) =>
      value && value.trim().length > 0 ? value.trim() : undefined;
    const company = normalize(data.companyId) ?? authCompanyId ?? undefined;
    const department = normalize(data.departmentId);
    const role = normalize(data.roleId);
    const password = normalize(data.password);

    try {
      if (userToEdit?.id) {
        const updatePayload: UpdateUserPayload = {
          id: userToEdit.id,
          phone: data.phone,
          isGlobalAdmin: data.isGlobalAdmin,
          status: data.status,
        };

        if (company) updatePayload.companyId = company;
        if (department) updatePayload.departmentId = department;
        if (role) updatePayload.roleId = role;

        const shouldUpdatePassword = password;
        if (shouldUpdatePassword) {
          updatePayload.password = password!;
        }

        await updateUser(updatePayload);
        toast.success(t("toasts.updateSuccess"));
      } else {
        if (!password) {
          form.setError("password", {
            type: "manual",
            message: t("validation.passwordRequired"),
          });
          return;
        }

        const createPayload: CreateUserPayload = {
          phone: data.phone,
          password,
          status: data.status,
        };

        if (canGrantGlobalAdmin) {
          createPayload.isGlobalAdmin = data.isGlobalAdmin;
        }

        if (company) createPayload.companyId = company;
        if (department) createPayload.departmentId = department;
        if (role) createPayload.roleId = role;

        await createUser(createPayload);
        toast.success(t("toasts.createSuccess"));
      }
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(t("toasts.error"));
    }
  };

  const isLoading = isCreating || isUpdating;
  const selectedCompanyId = form.watch("companyId") || authCompanyId || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-w-4xl p-0 overflow-hidden  dark:bg-slate-950">
        <DialogHeader className="pt-6 px-6 pb-2 border-b border-gray-100 bg-white dark:bg-slate-900/50">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {userToEdit ? t("title.edit") : t("title.create")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {t("fields.phone")}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <PhoneField
                          value={field.value ?? ""}
                          onChange={(value) => field.onChange(value ?? "")}
                          onBlur={field.onBlur}
                          disabled={isLoading}
                          size="lg"
                          maxLength={14}
                          className="rounded-xl border-gray-200 focus:ring-blue-500 transition-all bg-white"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5" />
                        {t("fields.password")}
                        {!userToEdit && <span className="text-red-500">*</span>}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={
                              userToEdit
                                ? t("placeholders.passwordEdit")
                                : t("placeholders.passwordCreate")
                            }
                            className="rounded-xl border-gray-200 focus:ring-blue-500 transition-all bg-white pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        {t("fields.company")}
                      </FormLabel>
                      <FormControl>
                        <CompanySelect
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        {t("fields.department")}
                      </FormLabel>
                      <FormControl>
                        <DepartmentSelect
                          value={field.value}
                          onChange={field.onChange}
                          companyId={selectedCompanyId}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                        <UserCog className="h-3.5 w-3.5" />
                        {t("fields.role")}
                      </FormLabel>
                      <FormControl>
                        <RoleSelect
                          value={field.value}
                          onChange={field.onChange}
                          companyId={selectedCompanyId}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row items-center justify-between rounded-xl bg-white p-4 border border-gray-200">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-semibold text-slate-900 cursor-pointer">
                            {t("fields.status")}
                          </FormLabel>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${field.value ? "bg-green-500" : "bg-gray-300"
                                }`}
                            ></div>
                            <span className="text-xs font-medium text-slate-500">
                              {field.value ? t("fields.active") : t("fields.inactive")}
                            </span>
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            className="cursor-pointer"
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                {canGrantGlobalAdmin && (
                  <FormField
                    control={form.control}
                    name="isGlobalAdmin"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-row items-center justify-between rounded-xl bg-white p-4 border border-gray-200">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {t("fields.isGlobalAdmin")}
                            </FormLabel>
                            <p className="text-xs font-medium text-slate-500">
                              {t("fields.isGlobalAdminDesc")}
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              className="cursor-pointer"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <DialogFooter className=" p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="shadow-lg rounded-xl px-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon("save")}...
                  </>
                ) : (
                  userToEdit ? tCommon("save") : tCommon("create")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

