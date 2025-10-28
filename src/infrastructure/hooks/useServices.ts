"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/infrastructure/utils/api'
import type { 
  Service, 
  CreateService, 
  UpdateService 
} from '@/infrastructure/schema/schema-service'
import { serviceSchema, defaultServices } from '@/infrastructure/schema/schema-service'
import { toast } from 'sonner'


export function useServicesQuery() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async (): Promise<Service[]> => {
      try {
        const response = await api.get('/services')
        console.log("services get" , response.data)
        return response.data as Service[]
      } catch {
        // Mock para testes quando o endpoint não existir
        return serviceSchema.array().parse(defaultServices)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export function useCompanyServicesQuery(companyId: string) {
  return useQuery({
    queryKey: ['services', 'company', companyId],
    queryFn: async (): Promise<Service[]> => {
      try {
        const response = await api.get(`/services/company/${companyId}`)
        return response.data as Service[]
      } catch {
        // Mock para testes quando o endpoint não existir
        return serviceSchema.array().parse(defaultServices)
      }
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateServiceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateService): Promise<Service> => {
      const response = await api.post('/services', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Serviço criado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar serviço')
    },
  })
}

export function useUpdateServiceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateService }): Promise<Service> => {
      const response = await api.put(`/services/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Serviço atualizado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar serviço')
    },
  })
}

export function useDeleteServiceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/services/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Serviço excluído com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir serviço')
    },
  })
}
