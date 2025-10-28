"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/infrastructure/utils/api'
import type { 
  Rsu, 
  CreateRsu, 
  UpdateRsu 
} from '@/infrastructure/schema/schema-rsu'
import { rsuSchema, mockRsu } from '@/infrastructure/schema/schema-rsu'
import { toast } from 'sonner'

export function useRsuQuery() {
  return useQuery({
    queryKey: ['rsu'],
    queryFn: async (): Promise<Rsu[]> => {
      try {
        const response = await api.get('/rsu')
        return response.data as Rsu[]
      } catch {
        // Sempre retorna mock quando não há dados da API
        return rsuSchema.array().parse(mockRsu)
      }
    },
    staleTime: 5 * 60 * 1000,
    // Sempre mostra dados mockados imediatamente
    initialData: rsuSchema.array().parse(mockRsu),
  })
}

export function useRsuByIdQuery(id: string) {
  return useQuery({
    queryKey: ['rsu', id],
    queryFn: async (): Promise<Rsu> => {
      try {
        const response = await api.get(`/rsu/${id}`)
        return response.data as Rsu
      } catch {
        // Mock para testes
        const rsu = mockRsu.find(r => r.id === id)
        if (!rsu) throw new Error('RSU não encontrado')
        return rsu
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateRsuMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRsu): Promise<Rsu> => {
      const response = await api.post('/rsu', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsu'] })
      toast.success('RSU criado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar RSU')
    },
  })
}

export function useUpdateRsuMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRsu }): Promise<Rsu> => {
      const response = await api.put(`/rsu/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsu'] })
      toast.success('RSU atualizado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar RSU')
    },
  })
}

export function useDeleteRsuMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/rsu/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsu'] })
      toast.success('RSU excluído com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir RSU')
    },
  })
}

