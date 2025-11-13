"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, HelpCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { shallow } from "zustand/shallow";
import { useUsers } from "@/infrastructure/hooks/useUsers";
import { useCompanyByIdQuery } from "@/infrastructure/hooks/useCompanies";
import { changePassword } from "@/infrastructure/adapters/auth";
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
import CreateUserDialog from "@/components/common/dashboard/users/create-users";

const passwordSchema = z
  .object({
    phone: z
      .string()
      .min(3, "Telefone obrigatório")
      .max(30, "Telefone muito longo"),
    currentPassword: z
      .string()
      .min(6, "Senha deve ter no mínimo 6 caracteres"),
    newPassword: z
      .string()
      .min(6, "Senha deve ter no mínimo 6 caracteres"),
  })
  .refine(
    ({ currentPassword, newPassword }) => currentPassword !== newPassword,
    {
      message: "A nova palavra-passe deve ser diferente da atual",
      path: ["newPassword"],
    }
  );

type PasswordFormData = z.infer<typeof passwordSchema>;

export function Settings(): React.ReactElement {
  const router = useRouter();


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-6 md:flex-row">
          <div className="flex-shrink-0">
            <Image
              src="/profile.png"
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
              <span className="hidden h-1 w-1 rounded-full bg-gray-400 md:inline-flex" />
              <span>{displayEmail}</span>
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
                      className="inline-flex items-center gap-2 text-primary hover:text-primary"
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
                        className="inline-flex items-center gap-2 text-primary hover:text-primary"
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
                            className="cursor-pointer"
                            disabled={passwordForm.formState.isSubmitting}
                          >
                            Guardar
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
                  Apenas administradores globais podem editar estes dados.
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="flex flex-col items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 md:flex-row">
          <div className="flex items-center gap-3 text-gray-800 dark:text-gray-100">
            <HelpCircle size={20} className="text-gray-600 dark:text-gray-300" />
            <h3 className="text-base font-semibold">Precisa de suporte?</h3>
          </div>
          <Button
            variant="outline"
            className="cursor-pointer"
            asChild
          >
            <a href="/dashboard/help" className="inline-flex items-center gap-2">
              Central de ajuda ↗
            </a>
          </Button>
        </section>
      </div>
    </div>
  );
}

