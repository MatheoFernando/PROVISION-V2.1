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
  Plus,
  Eye,
  EyeOff,
  Phone,
  Lock,
  Building2,
  UserCog,
  Users,
  ShieldCheck,
  X,
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { PhoneField } from "@/components/common/base-ui/inputs/phone-field";

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

  const isControlled =
    controlledOpen !== undefined && onOpenChange !== undefined;
  const open = controlledOpen ?? internalOpen;
  const isEditMode = Boolean(isEdit && user?.id);
  const isPasswordDisabled = isEditMode;

  const handleOpenChange = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    if (!isControlled) setInternalOpen(next);
  };

  const { createUser, updateUser, isCreating, isUpdating } = useUsers();
  const {
    companyId: authCompanyId,
    isGlobalAdmin: canGrantGlobalAdmin,
  } = useAuthStore();

  type UserFormSchema = z.infer<typeof userSchema>;

  const defaultValues = React.useMemo(
    () => ({
      id: user?.id,
      phone: user?.phone ?? "",
      password: "",
      isGlobalAdmin: user?.isGlobalAdmin ?? false,
      status: user?.status ?? true,
      companyId: user?.companyId ?? authCompanyId ?? "",
      departmentId:
        user?.departmentId ?? user?.employee?.departmentId ?? undefined,
      roleId: user?.roleId ?? "",
    }),
    [user, authCompanyId]
  );

  const form = useForm<UserFormSchema>({
    resolver: zodResolver(userSchema),
    defaultValues,
  });

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const onSubmit = async (data: UserFormSchema) => {
    const normalize = (value?: string | null) =>
      value && value.trim().length > 0 ? value.trim() : undefined;
    const company = normalize(data.companyId) ?? authCompanyId ?? undefined;
    const department = normalize(data.departmentId);
    const role = normalize(data.roleId);
    const password = normalize(data.password);

    try {
      if (isEditMode && user?.id) {
        const updatePayload: UpdateUserPayload = {
          id: user.id,
          phone: data.phone,
          isGlobalAdmin: data.isGlobalAdmin,
          status: data.status,
        };

        if (company) updatePayload.companyId = company;
        if (department) updatePayload.departmentId = department;
        if (role) updatePayload.roleId = role;

        const shouldUpdatePassword = !isPasswordDisabled && password;
        if (shouldUpdatePassword) {
          updatePayload.password = password!;
        }

        await updateUser(updatePayload);
      } else {
        if (!password) {
          form.setError("password", {
            type: "manual",
            message: "Senha é obrigatória para criar utilizador",
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
      }
      form.reset();
      closeDrawer();
    } catch (error) {
    }
  };

  const isLoading = isCreating || isUpdating;
  const selectedCompanyId = form.watch("companyId") || authCompanyId || "";
  const closeDrawer = () => handleOpenChange(false);

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} direction="right">
      {!isEdit && !isControlled && (
        <DrawerTrigger asChild>
          {children || (
            <Button className="h-10 cursor-pointer shadow-sm transition-all hover:shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Novo Utilizador
            </Button>
          )}
        </DrawerTrigger>
      )}
      <DrawerContent className="ml-auto flex h-full w-full max-w-3xl flex-col border-l border-slate-200 bg-white p-0">
        <DrawerHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <DrawerTitle className="text-2xl font-bold text-slate-950">
              {isEdit ? "Editar Utilizador" : "Novo Utilizador"}
            </DrawerTitle>

          </div>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full flex-col"
          >
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
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
                          <PhoneField
                            value={field.value ?? ""}
                            onChange={(value) => field.onChange(value ?? "")}
                            onBlur={field.onBlur}
                            disabled={isLoading}
                            size="lg"
                            maxLength={14}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    disabled={isPasswordDisabled}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5" />
                          Senha
                          {!isPasswordDisabled && <span className="text-red-500">*</span>}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder={
                                isPasswordDisabled
                                  ? "Deixe vazio para manter"
                                  : "Mínimo 6 caracteres"
                              }
                              disabled={isPasswordDisabled}
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
                                className={`h-2 w-2 rounded-full ${field.value ? "bg-green-500" : "bg-gray-400"
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
                              className="cursor-pointer data-[state=checked]:bg-green-600"
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
                          <div className="flex flex-row items-center justify-between rounded-xl bg-card">
                            <div className="space-y-1">
                              <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Super Administrador
                              </FormLabel>
                              <p className="text-xs font-medium text-muted-foreground">
                                Controla acesso global
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                className="cursor-pointer data-[state=checked]:bg-green-600"
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
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeDrawer}
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
      </DrawerContent>
    </Drawer>
  );
}

export default CreateUserDialog;
