

"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/infrastructure/utils/api'
import type { 
  Supervision, 
  CreateSupervision, 
  UpdateSupervision 
} from '@/infrastructure/schema/schema-supervision'
import { supervisionSchema, mockSupervisions } from '@/infrastructure/schema/schema-supervision'
import { toast } from 'sonner'

export function useSupervisionsQuery() {
  return useQuery({
    queryKey: ['supervisions'],
    queryFn: async (): Promise<Supervision[]> => {
      try {
        const response = await api.get('/supervisions')
        return response.data as Supervision[]
      } catch {
        return supervisionSchema.array().parse(mockSupervisions)
      }
    },
    staleTime: 5 * 60 * 1000,
    // Sempre mostra dados mockados imediatamente
    initialData: supervisionSchema.array().parse(mockSupervisions),
  })
}

export function useSupervisionQuery(id: string) {
  return useQuery({
    queryKey: ['supervisions', id],
    queryFn: async (): Promise<Supervision> => {
      try {
        const response = await api.get(`/supervisions/${id}`)
        return response.data as Supervision
      } catch {
        // Mock para testes
        const supervision = mockSupervisions.find(s => s.id === id)
        if (!supervision) throw new Error('Supervisão não encontrada')
        return supervision
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateSupervisionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateSupervision): Promise<Supervision> => {
      const response = await api.post('/supervisions', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisions'] })
      toast.success('Supervisão criada com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar supervisão')
    },
  })
}

export function useUpdateSupervisionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSupervision }): Promise<Supervision> => {
      const response = await api.put(`/supervisions/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisions'] })
      toast.success('Supervisão atualizada com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar supervisão')
    },
  })
}

export function useDeleteSupervisionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/supervisions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisions'] })
      toast.success('Supervisão excluída com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir supervisão')
    },
  })
}
