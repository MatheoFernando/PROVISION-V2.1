"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Edit2,
  HelpCircle,
  Lock,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DeleteModal } from "@/components/ui/delete-modal";
import CreateUserDialog from "@/components/common/dashboard/users/users-create";
import { useUsers } from "@/infrastructure/hooks/useUsers";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useCompanyByIdQuery } from "@/infrastructure/hooks/useCompanies";
import { useChangePasswordMutation } from "@/infrastructure/hooks/useChangePasswordMutation";
import type { User } from "@/infrastructure/types/domain";
import Link from "next/link";

const passwordSchema = z.object({
  phone: z.string().min(3, "Telefone obrigatório"),
  currentPassword: z.string().min(6, "Senha atual obrigatória"),
  newPassword: z.string().min(6, "Nova palavra-passe deve ter 6 caracteres"),
});

type PasswordSchema = z.infer<typeof passwordSchema>;

interface PasswordFormValues extends PasswordSchema {}

export function Settings(): React.ReactElement {
  const router = useRouter();
  const { companyId, isGlobalAdmin, userId } = useAuthStore();
  const targetCompanyId = companyId ?? undefined;

  const {
    users,
    isLoading: isUsersLoading,
    deleteUser,
    isDeleting,
  } = useUsers(targetCompanyId);
  const companyQuery = useCompanyByIdQuery(targetCompanyId);
  const company = companyQuery.data ?? null;
  const currentUser = React.useMemo(
    () => users.find((user) => user.id === userId) ?? null,
    [users, userId]
  );

  const employeeName = currentUser?.employee?.fullName ?? "Utilizador";
  const displayPhone = currentUser?.phone ?? "Telefone não informado";
  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);

  const canEditCompany = Boolean(isGlobalAdmin);
  const hasUserContext = Boolean(currentUser);

  const changePassword = useChangePasswordMutation();
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      phone: currentUser?.phone ?? "",
      currentPassword: "",
      newPassword: "",
    },
  });

  React.useEffect(() => {
    if (currentUser?.phone) {
      passwordForm.setValue("phone", currentUser.phone);
    }
  }, [currentUser?.phone, passwordForm]);

  const handleSubmitPassword = React.useCallback(
    async (values: PasswordFormValues) => {
      try {
        await changePassword.mutateAsync(values);
        toast.success("Palavra-passe atualizada com sucesso");
        passwordForm.reset({
          phone: values.phone,
          currentPassword: "",
          newPassword: "",
        });
        setIsPasswordDialogOpen(false);
      } catch {
        toast.error("Não foi possível alterar a palavra-passe");
      }
    },
    [changePassword, passwordForm]
  );

  const handleNavigateToCompanyEdit = React.useCallback(() => {
    if (!canEditCompany) return;
    router.push("/dashboard/companies");
  }, [canEditCompany, router]);


  const handleConfirmDelete = React.useCallback(async () => {
    if (!userToDelete?.id) {
      setUserToDelete(null);
      return;
    }

    try {
      await deleteUser(userToDelete.id);
      toast.success("Utilizador removido com sucesso");
    } catch {
      toast.error("Não foi possível remover o utilizador");
    } finally {
      setUserToDelete(null);
    }
  }, [deleteUser, userToDelete]);


  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-neutral-950 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-6 md:flex-row">
          <div className="flex-shrink-0">
            <Image
              src={currentUser?.employee?.photo ?? "/profile.png"}
              alt="Avatar do utilizador"
              width={160}
              height={160}
              className="h-32 w-32 rounded-lg object-cover md:h-36 md:w-36 lg:h-40 lg:w-40"
              priority
            />
          </div>
          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 md:text-3xl">
              {employeeName}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie informações pessoais, credenciais de acesso e dados da
              sua organização num único lugar.
            </p>
            <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400 md:flex-row md:items-center md:gap-4">
              <span>{displayPhone}</span>
            </div>
          </div>
        </header>

        <section className="rounded-lg border border-gray-200 bg-red-100 p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Atenção:</span> algumas configurações
            podem ser controladas pela sua organização.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <header className="mb-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Informações pessoais
              </h2>
            </header>

            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Telefone
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {displayPhone}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary cursor-pointer"
                      disabled={!currentUser || isUsersLoading}
                      onClick={() => setIsUserDialogOpen(true)}
                    >
                      <Edit2 size={16} />
                      Editar
                    </Button>
                    {isUserDialogOpen && currentUser ? (
                      <CreateUserDialog
                        key={currentUser.id}
                        isEdit
                        user={currentUser}
                        open={isUserDialogOpen}
                        onOpenChange={setIsUserDialogOpen}
                      />
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Segurança
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    Palavra-passe protegida
                  </span>
                  <Dialog
                    open={isPasswordDialogOpen}
                    onOpenChange={setIsPasswordDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary cursor-pointer"
                        disabled={!hasUserContext}
                      >
                        <Lock size={16} />
                        Alterar palavra-passe
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Alterar palavra-passe</DialogTitle>
                      </DialogHeader>
                      <Form {...passwordForm}>
                        <form
                          onSubmit={passwordForm.handleSubmit(
                            handleSubmitPassword
                          )}
                          className="grid gap-4"
                          noValidate
                        >
                          <FormField
                            control={passwordForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="+244..."
                                    inputMode="tel"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Senha atual</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="password"
                                    autoComplete="current-password"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nova palavra-passe</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="password"
                                    autoComplete="new-password"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={passwordForm.formState.isSubmitting}
                          >
                            {passwordForm.formState.isSubmitting ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                A guardar...
                              </span>
                            ) : (
                              "Guardar"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-lg border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <header className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Dados da empresa
              </h2>
              <Button
                variant="ghost"
                className="inline-flex items-center gap-2 text-primary hover:text-primary"
                disabled={!canEditCompany}
                onClick={handleNavigateToCompanyEdit}
              >
                <Edit2 size={16} />
                Editar
              </Button>
            </header>

            <div className="space-y-5 text-sm text-gray-900 dark:text-gray-100">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Nome fiscal
                </p>
                <p className="mt-2">
                  {company?.taxName ?? (companyQuery.isLoading ? "..." : "-")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Nome comercial
                </p>
                <p className="mt-2">
                  {company?.businessName ??
                    (companyQuery.isLoading ? "..." : "-")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  NIF
                </p>
                <p className="mt-2">
                  {company?.nif ?? (companyQuery.isLoading ? "..." : "-")}
                </p>
              </div>
              {!canEditCompany && (
                <p className="rounded-md bg-gray-100 p-3 text-xs text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
                  Apenas administradores  podem editar estes dados.
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="flex flex-col items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 md:flex-row">
          <div className="flex items-center gap-3 text-gray-800 dark:text-gray-100">
            <HelpCircle
              size={20}
              className="text-gray-600 dark:text-gray-300"
            />
            <h3 className="text-base font-semibold">Precisa de suporte?</h3>
          </div>

            <Link href="/dashboard/help" className="inline-flex items-center gap-2 text-primary hover:text-primary cursor-pointer">
              Central de ajuda ↗
            </Link>
         
        </section>
      </div>

      <DeleteModal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remover utilizador"
        message={
          userToDelete
            ? `Deseja remover ${userToDelete.employee?.fullName ?? userToDelete.phone}?`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
