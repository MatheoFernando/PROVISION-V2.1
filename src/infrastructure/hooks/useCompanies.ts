"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/infrastructure/utils/api'
import type { 
  Company, 
  CreateCompanyPayload, 
  UpdateCompanyPayload 
} from '@/types/domain'
import type { 
  CompanyModuleWithDetails, 
  UpdateCompanyModule, 
  CompanyModule 
} from '@/infrastructure/schema/schema-company-module'
import { toast } from 'sonner'
import { z } from 'zod'
import { companySchema } from '@/infrastructure/schema/schema-company'



export function useCompaniesQuery() {
  return useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async (): Promise<Company[]> => {
      const { data } = await api.get('/company/GetAll')
     
      return data?.data ?? data ?? []
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  })
}

export function useCompanyByIdQuery(id?: string) {
  return useQuery<Company | null>({
    queryKey: ['company', id],
    queryFn: async (): Promise<Company | null> => {
      if (!id) return null
      const { data } = await api.get(`/company/${id}`)
      const parsed = companySchema.safeParse(data?.data ?? data)
      if (!parsed.success) throw new Error('Falha ao validar empresa')
      return parsed.data as Company
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCompanyByCodQuery(cod?: string) {
  return useQuery<Company | null>({
    queryKey: ['company-cod', cod],
    queryFn: async (): Promise<Company | null> => {
      if (!cod) return null
      const { data } = await api.get(`/company/cod/${cod}`)
      const parsed = companySchema.safeParse(data?.data ?? data)
      if (!parsed.success) throw new Error('Falha ao validar empresa')
      return parsed.data as Company
    },
    enabled: !!cod,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCompaniesByNameQuery(name?: string) {
  return useQuery<Company[]>({
    queryKey: ['companies-name', name],
    queryFn: async (): Promise<Company[]> => {
      if (!name) return []
      const { data } = await api.get('/company/name', { params: { name } })
      const listSchema = z.array(companySchema)
      const parsed = listSchema.safeParse(data?.data ?? data)
      if (!parsed.success) throw new Error('Falha ao validar empresas por nome')
      return parsed.data as Company[]
    },
    enabled: !!name,
    staleTime: 5 * 60 * 1000,
  })
}


export function useCompanyModulesByModuleQuery(moduleId: string) {
  return useQuery({
    queryKey: ['company-modules', 'module', moduleId],
    queryFn: async (): Promise<CompanyModuleWithDetails[]> => {
      const response = await api.get(`/company-modules/${moduleId}`)
      return response.data
    },
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000,
  })
}


export function useCreateCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string; data?: Company }, unknown, CreateCompanyPayload>({
    mutationKey: ['company-create'],
    mutationFn: async (payload: CreateCompanyPayload) => {
      const { data } = await api.post('/company/create', payload)
      return data
    },
    onSuccess: (data) => {
      console.log('Empresa criada com sucesso', data)
      void queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Empresa criada com sucesso')
    },
    onError: (error) => {
      console.log('Erro ao criar empresa', error)
      toast.error('Erro ao criar empresa')
    },
  })
}

export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string; data?: Company }, unknown, UpdateCompanyPayload>({
    mutationKey: ['company-update'],
    mutationFn: async (payload: UpdateCompanyPayload) => {
      const { data } = await api.put('/company', payload)
      return data
    },
    onSuccess: (data) => {
      console.log('Empresa atualizada com sucesso', data)
      void queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Empresa atualizada com sucesso')
    },
    onError: (error) => {
      console.log('Erro ao atualizar empresa', error)
      toast.error('Erro ao atualizar empresa')
    },
  })
}

export function useDeleteCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string }, unknown, string>({
    mutationKey: ['company-delete'],
    mutationFn: async (companyId: string) => {
      const { data } = await api.delete(`/company/${companyId}`)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Empresa excluída com sucesso')
    },
    onError: () => {
      toast.error('Erro ao excluir empresa')
    },
  })
}


export function useUpdateCompanyModuleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCompanyModule }): Promise<CompanyModule> => {
      const response = await api.put(`/company-modules/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-modules'] })
      toast.success('Associação atualizada com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar associação')
    },
  })
}

export function useDeleteCompanyModuleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/company-modules/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-modules'] })
      toast.success('Associação excluída com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir associação')
    },
  })
}
