"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/infrastructure/utils/api'
import type { User, CreateUserPayload, UpdateUserPayload } from '@/infrastructure/schema/schema-user'
import { toast } from 'sonner'

export function useUsersQuery() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      try {
        const { data } = await api.get('/user/GetAll')
        return data?.data ?? []
      } catch {
        // Sempre retorna mock quando não há dados da API
        return []
      }
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    // Sempre mostra dados mockados imediatamente
    initialData: [],
  })
}


export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string; data?: User }, unknown, CreateUserPayload>({
    mutationKey: ['user-create'],
    mutationFn: async (payload: CreateUserPayload) => {
      const { data } = await api.post('/user/create', payload)
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
      const { id, ...updateData } = payload
      const { data } = await api.put(`/user/update/${id}`, updateData)
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
      const { data } = await api.delete(`/user/delete/${userId}`)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Utilizador deletado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao deletar utilizador')
    },
  })
}

export function useUsers() {
  const usersQuery = useUsersQuery()
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

