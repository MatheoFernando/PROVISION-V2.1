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
} from "lucide-react";
import { useUsers } from "@/infrastructure/hooks/useUsers";
import type { User } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { useRoles } from "@/infrastructure/hooks/useRoles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanySelect } from "../../base-ui/selects/company-select";
import { userSchema } from "@/infrastructure/schema/schema-user";
import { z } from "zod";

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

  type UserFormSchema = z.infer<typeof userSchema>;

  const form = useForm<UserFormSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      phone: user?.phone || "",
      password: user?.password || "",
      isGlobalAdmin: user?.isGlobalAdmin || false,
      status: user?.status ?? true,
      companyId: user?.companyId || "",
    },
  });

  React.useEffect(() => {
    if (user && isEdit) {
      form.reset({
        phone: user.phone,
        password: user.password || "",
        isGlobalAdmin: user.isGlobalAdmin,
        status: user.status,
        companyId: user.companyId || "",
      });
    }
  }, [user, isEdit, form]);

  const onSubmit = async (data: UserFormSchema) => {
    try {
      let payload: any = { ...data };
      console.log(payload)
      if (!payload.roleId) {
        delete payload.roleId;
      }
      if (isEdit && user) {
        
        await updateUser({ ...payload, id: user.id });
      } else {
        await createUser(payload);
      }
      form.reset();
      setOpen(false);
    } catch (error) {
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEdit && (
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
        <div className="bg-slate-100 dark:from-blue-950/30 dark:to-indigo-950/30 px-6 py-5 border-b">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="relative">
                          <Input
                            placeholder="9XX XXX XXX"
                            className="h-11 pl-4 transition-all focus:ring-2 focus:ring-blue-500/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
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
                        {!isEdit ? (
                          <Badge variant="default" className="ml-2 text-xs">
                            Opcional
                          </Badge>
                        ) : (
                          <span className="text-red-500"></span>
                        )}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row items-center justify-between rounded-xl border-2 p-3 transition-all hover:border-blue-200 dark:hover:border-blue-800 bg-card">
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
