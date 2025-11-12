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
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Plus,
  Eye,
  EyeOff,
  Phone,
  Lock,
  Building2,
  Shield,
  UserCog,
  Users,
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
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface CreateUserDialogProps {
  children?: React.ReactNode;
  user?: User | null;
  isEdit?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}


function CreateUserDialog({
  children,
  user,
  isEdit = false,
  open: controlledOpen,
  onOpenChange,
}: CreateUserDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const { createUser, updateUser, isCreating, isUpdating } = useUsers();
  const { companyId: authCompanyId } = useAuthStore();

  type UserFormSchema = z.infer<typeof userSchema>;

  const form = useForm<UserFormSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      id: user?.id,
      phone: user?.phone || "",
      password: "",
      isGlobalAdmin: user?.isGlobalAdmin || false,
      status: user?.status ?? true,
      companyId: user?.companyId || authCompanyId || "",
      departmentId: user?.employee?.departmentId || "",
      roleId: user?.roleId || "",
    },
  });

  React.useEffect(() => {
    if (user && isEdit) {
      form.reset({
        id: user.id,
        phone: user.phone,
        password: "",
        isGlobalAdmin: user.isGlobalAdmin,
        status: user.status,
        companyId: user.companyId || authCompanyId || "",
        departmentId: user?.employee?.departmentId || "",
        roleId: user?.roleId || "",
      });
    }
  }, [user, isEdit, form, authCompanyId]);

  const onSubmit = async (data: UserFormSchema) => {
    try {
      const company = data.companyId || authCompanyId || undefined;
      const department = data.departmentId || undefined;
      const role = data.roleId || undefined;

      if (isEdit && user) {
        const updatePayload: UpdateUserPayload = {
          id: user.id!,
          phone: data.phone,
          isGlobalAdmin: data.isGlobalAdmin,
          status: data.status,
        };

        if (company) updatePayload.companyId = company;
        if (department) updatePayload.departmentId = department;
        if (role) updatePayload.roleId = role;

        if (
          form.formState.dirtyFields.password &&
          data.password &&
          data.password.trim().length >= 6
        ) {
          updatePayload.password = data.password;
        }

        await updateUser(updatePayload);
      } else {
        if (!data.password) {
          throw new Error("Senha obrigatória");
        }

        const createPayload: CreateUserPayload = {
          phone: data.phone,
          password: data.password,
          isGlobalAdmin: data.isGlobalAdmin,
          status: data.status,
        };

        if (company) createPayload.companyId = company;
        if (department) createPayload.departmentId = department;
        if (role) createPayload.roleId = role;

        await createUser(createPayload);
      }
      form.reset();
      setOpen(false);
    } catch (error) {
    }
  };

  const isLoading = isCreating || isUpdating;
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const selectedCompanyId =
    form.watch("companyId") || authCompanyId || "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEdit && !isControlled && (
        <DialogTrigger asChild>
          {children || (
            <Button className="h-10 cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-sm transition-all hover:shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Novo Utilizador
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[650px] max-h-[95vh] overflow-y-auto p-0">
        <div className="bg-slate-50 dark:from-blue-950/30 dark:to-indigo-950/30 px-6 py-5 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {isEdit ? "Editar Utilizador" : "Novo Utilizador"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 py-6 space-y-6"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        Telefone
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <PhoneInput
                          defaultCountry="AO"
                          international={false}
                          value={field.value ?? ""}
                          onChange={(value) => field.onChange(value ?? "")}
                          onBlur={field.onBlur}
                          disabled={isLoading}
                          className="flex h-11 w-full items-center rounded-md border border-input bg-background px-3 text-sm transition-colors shadow-xs  focus-within:border-blue-500/80 focus:ring-0  focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          inputClassName="w-full border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  disabled={isEdit}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5" />
                        Senha
                        {!isEdit && <span className="text-red-500">*</span>}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={
                              isEdit
                                ? "Deixe vazio para manter"
                                : "Mínimo 6 caracteres"
                            }
                            disabled={isEdit}
                            className="h-11 pl-4 pr-11 transition-all focus:ring-2 focus:ring-blue-500/20"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-1"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      {isEdit && (
                        <FormDescription className="text-xs">
                          Deixe em branco para manter a senha atual
                        </FormDescription>
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        Empresa
                      </FormLabel>
                      <FormControl>
                        <CompanySelect
                          value={field.value}
                          onChange={field.onChange}
                          required={!isEdit}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        Departamento
                      </FormLabel>
                      <FormControl>
                        <DepartmentSelect
                          value={field.value}
                          onChange={field.onChange}
                          companyId={selectedCompanyId}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                        <UserCog className="h-3.5 w-3.5" />
                        Função
                      </FormLabel>
                      <FormControl>
                        <RoleSelect
                          value={field.value}
                          onChange={field.onChange}
                          companyId={selectedCompanyId}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                  <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row items-center justify-between rounded-xl dark:hover:border-blue-800 bg-card">
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-semibold text-foreground cursor-pointer">
                            Estado do Utilizador
                          </FormLabel>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                field.value ? "bg-green-500" : "bg-gray-400"
                              }`}
                            ></div>
                            <span className="text-xs font-medium text-muted-foreground">
                              {field.value ? "Activo" : "Inactivo"}
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

              </div>

              </div>
          
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <h3 className="text-sm font-semibold text-foreground  tracking-wide">
                  Permissões e Estado
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
                <FormField
                  control={form.control}
                  name="isGlobalAdmin"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row items-center justify-between rounded-xl border-2 p-3 transition-all hover:border-blue-200 dark:hover:border-blue-800 bg-card">
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-2 cursor-pointer">
                            <Shield className="h-4 w-4 " />
                            Admin Global
                          </FormLabel>
                          <FormDescription className="text-xs text-muted-foreground">
                            Acesso a todas as empresas
                          </FormDescription>
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
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="px-6 cursor-pointer"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8 bg-blue-500 hover:bg-blue-600 cursor-pointer text-white shadow-sm hover:shadow-md transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />A
                    guardar...
                  </>
                ) : (
                  <>{isEdit ? "Atualizar Utilizador" : "Criar Utilizador"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateUserDialog;
