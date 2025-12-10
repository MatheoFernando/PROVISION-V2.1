"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/infrastructure/utils/api'
import type { User, CreateUserPayload, UpdateUserPayload } from '@/infrastructure/types/domain'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function useUsersQuery(companyId?: string) {
  return useQuery<User[]>({
    queryKey: ['users', companyId ?? 'current-company'],
    queryFn: async (): Promise<User[]> => {
      const { data } = await api.get('/users/getAllByCompanyId', companyId ? { params: { companyId } } : undefined)
      return data?.data ?? data ?? []
    },
    enabled: true,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  })
}


export function useCreateUser() {
  const queryClient = useQueryClient()
  const t = useTranslations("Hooks.Users");

  return useMutation<{ message: string; data?: User }, unknown, CreateUserPayload>({
    mutationKey: ['user-create'],
    mutationFn: async (payload: CreateUserPayload) => {
      const { data } = await api.post('/users/create', payload)
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.refetchQueries({ queryKey: ['users'], type: 'active' })
      toast.success(t('create.success'))
    },
    onError: () => {
      toast.error(t('create.error'))
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const t = useTranslations("Hooks.Users");

  return useMutation<{ message: string; data?: User }, unknown, UpdateUserPayload>({
    mutationKey: ['user-update'],
    mutationFn: async (payload: UpdateUserPayload) => {
      const { data } = await api.put('/users', payload)
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.refetchQueries({ queryKey: ['users'], type: 'active' })
      toast.success(t('update.success'))
    },
    onError: () => {
      toast.error(t('update.error'))
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  const t = useTranslations("Hooks.Users");

  return useMutation<{ message: string }, unknown, string>({
    mutationKey: ['user-delete'],
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/users/${userId}`)
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.refetchQueries({ queryKey: ['users'], type: 'active' })
      toast.success(t('delete.success'))
    },
    onError: () => {
      toast.error(t('delete.error'))
    },
  })
}

export function useUsers(companyId?: string) {
  const usersQuery = useUsersQuery(companyId)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,

    isCreating: createUser.isPending,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending,

    createUser: createUser.mutateAsync,
    updateUser: updateUser.mutateAsync,
    deleteUser: deleteUser.mutateAsync,

    refetch: usersQuery.refetch,
  }
}

