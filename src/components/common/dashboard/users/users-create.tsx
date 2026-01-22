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
  UserCog,
  Users,
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  RefreshCw,
  UserCircle,
} from "lucide-react";
import { useUsers } from "@/infrastructure/hooks/useUsers";
import type { User } from "@/infrastructure/types/domain";

import { RoleSelect } from "../../base-ui/selects/role-select";
import { EmployeeSelect } from "../../base-ui/selects/employee-select";
import { CustomerSelect } from "../../base-ui/selects/customer-select";
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
import { PhoneField } from "@/components/common/base-ui/phone-field";
import { toast } from "sonner";
import { api } from "@/infrastructure/utils/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

const STANDARD_DEPARTMENTS = [
  { code: "DG", name: "Direcção Geral" },
  { code: "DO", name: "Deptº Operações" },
  { code: "DRH", name: "Deptº Recursos Humanos" },
  { code: "DAF", name: "Deptº Admin. e Finanças" },
  { code: "DC", name: "Deptº Comercial" },
  { code: "QHSA", name: "Deptº QHSA (Qualidade, Saúde, Segurança e Ambiente)" },
  { code: "MAN", name: "Deptº Manutenção" },
  { code: "DL", name: "Deptº Logística" },
  { code: "APP", name: "Aplicativo" },
] as const;

interface UserDialogProps {
  userToEdit?: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UserDialog({
  userToEdit,
  open,
  onOpenChange,
  onSuccess,
}: UserDialogProps) {
  const t = useTranslations("Users");
  const tCommon = useTranslations("Common");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);


  const { createUser, updateUser, isCreating, isUpdating } = useUsers();
  const {
    companyId: authCompanyId,
    isGlobalAdmin: canGrantGlobalAdmin,
  } = useAuthStore();

  type UserFormSchema = z.infer<typeof userSchema>;

  const getInitialDepartmentValue = React.useCallback(() => {
    if (!userToEdit) return "";
    
    if (userToEdit.employee?.department?.name) {
       const deptName = userToEdit.employee.department.name;
       const match = STANDARD_DEPARTMENTS.find(d => 
          d.name === deptName || `${d.code} ${d.name}` === deptName
       );
       if (match) return `${match.code} ${match.name}`;
    }

    return userToEdit.departmentId ?? userToEdit.employee?.departmentId ?? "";
  }, [userToEdit]);

  const defaultValues = React.useMemo(
    () => ({
      id: userToEdit?.id,
      phone: userToEdit?.phone ?? "",
      email: "", 
      password: "",
      isGlobalAdmin: userToEdit?.isGlobalAdmin ?? false,
      status: userToEdit?.status ?? true,
      companyId: userToEdit?.companyId ?? authCompanyId ?? "",
      departmentId: getInitialDepartmentValue(),
      roleId: userToEdit?.roleId ?? "",
      employeeId: userToEdit?.employee?.id ?? "",
      customerId: "",
    }),
    [userToEdit, authCompanyId, getInitialDepartmentValue]
  );

  const form = useForm<UserFormSchema>({
    resolver: zodResolver(userSchema),
    defaultValues,
  });
  
  const watchedPhone = form.watch("phone");
  const watchedPassword = form.watch("password");
  
  const hasInvalidPhone = watchedPhone?.includes("/");
  const hasInvalidPassword = watchedPassword ? watchedPassword.length < 6 && watchedPassword.length > 0 : false;

  React.useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, open]);

  const generatePassword = React.useCallback(() => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lowercase = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";
      const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const allChars = uppercase + lowercase + numbers + special;
      
      let password = "";
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += special[Math.floor(Math.random() * special.length)];
      
      for (let i = password.length; i < 12; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }
      
      // Shuffle the password
      password = password.split("").sort(() => Math.random() - 0.5).join("");
      
      form.setValue("password", password);
      setIsGenerating(false);
    }, 300);
  }, [form]);

  const onSubmit = async (data: UserFormSchema) => {
    setIsProcessing(true);
    const normalize = (value?: string | null) =>
      value && value.trim().length > 0 ? value.trim() : undefined;
    
    const company = authCompanyId; 
    let finalDepartmentId = normalize(data.departmentId);
    const role = normalize(data.roleId);
    const email = normalize(data.email);
    const employeeId = normalize(data.employeeId);
    const customerId = normalize(data.customerId);
    
    const password = data.password ? data.password.trim() : undefined;

    try {
      if (finalDepartmentId && company) {
        const departmentName = finalDepartmentId;
        
        try {
            const { data: newDept } = await api.post("/department/create", {
              name: departmentName,
              companyId: company
            });
            const created = newDept?.data ?? newDept;
            finalDepartmentId = created.id;
        } catch (err) {
            console.error("Failed to resolve department", err);
            toast.error("Erro ao processar departamento.");
            setIsProcessing(false);
            return;
        }
      }

      if (userToEdit?.id) {
        const updatePayload: UpdateUserPayload = {
          id: userToEdit.id,
          phone: data.phone,
          isGlobalAdmin: data.isGlobalAdmin,
          status: data.status,
        };

        if (company) updatePayload.companyId = company;
        if (finalDepartmentId) updatePayload.departmentId = finalDepartmentId;
        if (role) updatePayload.roleId = role;
      
        if (password && password.length > 0) {
          updatePayload.password = password;
        }

        await updateUser(updatePayload);
        toast.success(t("toasts.updateSuccess"));
      } else {
        if (!password) {
          form.setError("password", {
            type: "manual",
            message: t("validation.passwordRequired"),
          });
          setIsProcessing(false);
          return;
        }

        const createPayload: CreateUserPayload = {
          phone: data.phone,
          password: password, 
          status: data.status,
        };

        if (canGrantGlobalAdmin) {
          createPayload.isGlobalAdmin = data.isGlobalAdmin;
        }

        if (company) createPayload.companyId = company;
        if (finalDepartmentId) createPayload.departmentId = finalDepartmentId;
        if (role) createPayload.roleId = role;
        if (email) createPayload.email = email;

        const result = await createUser(createPayload);
        const createdUserId = result?.id || result?.data?.id;
        
        // Link employee to user if employeeId is provided
        if (employeeId && createdUserId) {
          try {
            await api.patch("/employee/update", {
              id: employeeId,
              userId: createdUserId,
            });
          } catch (err) {
            console.error("Failed to link employee", err);
            toast.error("Utilizador criado, mas falhou ao vincular funcionário.");
          }
        }
        
        // Link customer to user if customerId is provided
        if (customerId && createdUserId) {
          try {
            await api.patch("/customer/update", {
              id: customerId,
              userId: createdUserId,
            });
          } catch (err) {
            console.error("Failed to link customer", err);
            toast.error("Utilizador criado, mas falhou ao vincular cliente.");
          }
        }
        
        toast.success(t("toasts.createSuccess"));
      }
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isCreating || isUpdating || isProcessing;
  const selectedCompanyId = authCompanyId || "";

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
                          className={`rounded focus:ring-blue-500 transition-all bg-white ${
                            hasInvalidPhone 
                              ? "!border-red-500 !border-2" 
                              : "border-gray-200"
                          }`}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="exemplo@email.com"
                          className="rounded border-gray-200 focus:ring-blue-500 transition-all bg-white"
                          {...field}
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
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder={
                                userToEdit
                                  ? t("placeholders.passwordEdit")
                                  : t("placeholders.passwordCreate")
                              }
                              className={`rounded focus:ring-blue-500 transition-all bg-white pr-10 ${
                                hasInvalidPassword && !userToEdit
                                  ? "!border-red-500 !border-2" 
                                  : "border-gray-200"
                              }`}
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
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={generatePassword}
                            disabled={isLoading || isGenerating}
                            className="shrink-0"
                            title="Gerar palavra-passe"
                          >
                            {isGenerating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full rounded border-gray-200 bg-white">
                            <SelectValue placeholder={t("fields.department")} />
                          </SelectTrigger>
                          <SelectContent>
                            {STANDARD_DEPARTMENTS.map((dept) => (
                              <SelectItem 
                                key={dept.code} 
                                value={dept.code} 
                              >
                                <span className="font-bold">{dept.code}</span> - {dept.name} {/* Display code in bold */}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                        <UserCircle className="h-3.5 w-3.5" />
                        Funcionário
                      </FormLabel>
                      <FormControl>
                        <EmployeeSelect
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
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        Cliente
                      </FormLabel>
                      <FormControl>
                        <CustomerSelect
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
                      <div className="flex flex-row items-center justify-between rounded bg-white p-4 border border-gray-200">
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
