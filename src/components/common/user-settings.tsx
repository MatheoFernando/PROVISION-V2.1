"use client"
import React from 'react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, Lock, HelpCircle, Check } from 'lucide-react';
import { useUsers } from '@/infrastructure/hooks/useUsers';
import { useCompanyByIdQuery, useUpdateCompanyMutation } from '@/infrastructure/hooks/useCompanies';
import { changePassword } from '@/infrastructure/adapters/auth';
import { toast } from 'sonner';

// UI (Shadcn)
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserLite {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
  companyId?: string;
}

const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().email().optional(),
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().min(3).max(30).optional(),
});

const companySchema = z.object({
  id: z.string().min(1),
  taxName: z.string().min(2).max(120).optional(),
  businessName: z.string().min(2).max(120).optional(),
  nif: z.string().min(2).max(50).optional(),
});

const passwordSchema = z.object({
  phone: z.string().min(3),
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export default function UserProfile() {
  const userId = Cookies.get('userId');
  const companyId = Cookies.get('companyId');

  const { users, updateUser, isLoading } = useUsers(companyId);
  const currentUser = users.find((u: any) => u?.id === userId) as Partial<UserLite> | undefined;

  const companyQuery = useCompanyByIdQuery(companyId);
  const updateCompany = useUpdateCompanyMutation();

  // Forms
  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      id: currentUser?.id ?? userId ?? '',
      email: currentUser?.email ?? '',
      fullName: (currentUser as any)?.fullName ?? '',
      phone: currentUser?.phone ?? '',
    },
    values: {
      id: currentUser?.id ?? userId ?? '',
      email: currentUser?.email ?? '',
      fullName: (currentUser as any)?.fullName ?? '',
      phone: currentUser?.phone ?? '',
    },
  });

  const companyForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      id: (companyQuery.data as any)?.id ?? companyId ?? '',
      taxName: (companyQuery.data as any)?.taxName ?? '',
      businessName: (companyQuery.data as any)?.businessName ?? '',
      nif: (companyQuery.data as any)?.nif ?? '',
    },
    values: {
      id: (companyQuery.data as any)?.id ?? companyId ?? '',
      taxName: (companyQuery.data as any)?.taxName ?? '',
      businessName: (companyQuery.data as any)?.businessName ?? '',
      nif: (companyQuery.data as any)?.nif ?? '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      phone: currentUser?.phone ?? '',
      currentPassword: '',
      newPassword: '',
    },
  });

  async function onSubmitUser(values: z.infer<typeof userSchema>) {
    const parsed = userSchema.safeParse(values);
    if (!parsed.success) return toast.error('Dados do utilizador inválidos');
    await updateUser(parsed.data as unknown as any);
  }

  async function onSubmitCompany(values: z.infer<typeof companySchema>) {
    const parsed = companySchema.safeParse(values);
    if (!parsed.success) return toast.error('Dados da empresa inválidos');
    await updateCompany.mutateAsync(parsed.data as unknown as any);
  }

  async function onSubmitPassword(values: z.infer<typeof passwordSchema>) {
    const parsed = passwordSchema.safeParse(values);
    if (!parsed.success) return toast.error('Dados inválidos');
    const res = await changePassword(parsed.data);
    if (res.success) toast.success('Palavra‑passe alterada');
    else toast.error(res.message ?? 'Falha ao alterar palavra‑passe');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-shrink-0">
            <Image
              src="/profile.png"
              alt="Avatar"
              width={150}
              height={150}
              className="w-32 h-32 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-lg object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {(currentUser as any)?.fullName ?? 'Utilizador'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Visualize e gerencie suas informações pessoais, segurança e preferências aqui.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 mb-6 flex gap-3">
    
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Suas configurações de usuário são gerenciadas pela sua organização.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">Informações pessoais</h2>

            <div className="space-y-5">
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400">Telefone</Label>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-900 dark:text-gray-100">{currentUser?.email ?? '-'}</span>
                  <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-2.5 py-1 rounded">
                    <Check size={14} />
                    Verificado
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400">Gestor</Label>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-2">{(currentUser as any)?.fullName ?? '-'}</p>
              </div>

             
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-6 inline-flex items-center gap-2 cursor-pointer">
                  <Edit2 size={16} />
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar utilizador</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={userForm.handleSubmit(onSubmitUser)}
                  className="grid gap-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" {...userForm.register('email')} placeholder="email@dominio.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Nome</Label>
                    <Input id="fullName" {...userForm.register('fullName')} placeholder="Nome completo" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" {...userForm.register('phone')} placeholder="+244..." />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    Guardar alterações
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">Empresa</h2>

            <div className="space-y-5">
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400">Nome fiscal</Label>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-2">{(companyQuery.data as any)?.taxName ?? '-'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400">Nome Comercial</Label>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-2">{(companyQuery.data as any)?.businessName ?? '-'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400">NIF</Label>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-2">{(companyQuery.data as any)?.nif ?? '-'}</p>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-6 inline-flex items-center gap-2 cursor-pointer">
                  <Edit2 size={16} />
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar empresa</DialogTitle>
                </DialogHeader>
                <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="taxName">Nome fiscal</Label>
                    <Input id="taxName" {...companyForm.register('taxName')} placeholder="Nome fiscal" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="businessName">Razão social</Label>
                    <Input id="businessName" {...companyForm.register('businessName')} placeholder="Razão social" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nif">NIF</Label>
                    <Input id="nif" {...companyForm.register('nif')} placeholder="NIF" />
                  </div>
                  <Button type="submit" disabled={updateCompany.isPending}>Guardar alterações</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6 mb-6 flex items-center justify-between flex-col md:flex-row gap-4">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-gray-600 dark:text-gray-300" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Senha</h3>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className='cursor-pointer'>Alterar palavra‑passe</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Alterar palavra‑passe</DialogTitle>
              </DialogHeader>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pphone">Telefone</Label>
                  <Input id="pphone" {...passwordForm.register('phone')} placeholder="+244..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Senha atual</Label>
                  <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
                </div>
                <Button type="submit">Guardar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6 flex items-center justify-between flex-col md:flex-row gap-4">
          <div className="flex items-center gap-3">
            <HelpCircle size={20} className="text-gray-600 dark:text-gray-300" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Precisa de suporte?</h3>
          </div>
          <Button variant="outline" className='cursor-pointer'>Central de ajuda ↗</Button>
        </div>
      </div>
    </div>
  );
}