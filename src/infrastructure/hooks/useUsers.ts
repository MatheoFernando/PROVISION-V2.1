"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/infrastructure/utils/api'
import type { User, CreateUserPayload, UpdateUserPayload } from '@/infrastructure/types/domain'
import { toast } from 'sonner'

export function useUsersQuery(companyId?: string) {
  return useQuery<User[]>({
    queryKey: ['users', companyId ?? 'current-company'],
    queryFn: async (): Promise<User[]> => {
      const { data } = await api.get('/users/getAllByCompanyId', companyId ? { params: { companyId } } : undefined)
      return data?.data ?? data ?? []
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  })
}


export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string; data?: User }, unknown, CreateUserPayload>({
    mutationKey: ['user-create'],
    mutationFn: async (payload: CreateUserPayload) => {
      const { data } = await api.post('/users/create', payload)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Utilizador criado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao criar utilizador')
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string; data?: User }, unknown, UpdateUserPayload>({
    mutationKey: ['user-update'],
    mutationFn: async (payload: UpdateUserPayload) => {
      const { data } = await api.put('/users', payload)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Utilizador atualizado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao atualizar utilizador')
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string }, unknown, string>({
    mutationKey: ['user-delete'],
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/users/${userId}`)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Utilizador eliminado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao deletar utilizador')
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

