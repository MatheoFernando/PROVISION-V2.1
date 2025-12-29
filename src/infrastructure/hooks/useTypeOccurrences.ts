import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { api } from '@/infrastructure/utils/api';
import type { TypeOccurrence } from '@/infrastructure/schema/schema-type-occurrence';

export function useTypeOccorrences(companyId?: string) {
  return useQuery({
    queryKey: ['type-occurrences', companyId],
    queryFn: async (): Promise<TypeOccurrence[]> => {
      if (!companyId) return [];
      try {
        const { data } = await api.get(`/typeOccorrence/getAllbyCompany/${companyId}`);
        return data?.data ?? data ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!companyId,
  });
}

export function useTypeOccurrence(id: string) {
  return useQuery({
    queryKey: ['type-occurrence', id],
    queryFn: async (): Promise<TypeOccurrence | null> => {
      const { data } = await api.get(`/typeOccorrence/getById?id=${id}`);
      return data?.data ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateTypeOccurrenceMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.TypeOccurrence");

  return useMutation({
    mutationFn: async (data: TypeOccurrence): Promise<TypeOccurrence> => {
      const { data: response } = await api.post('/typeOccorrence/create', data);
      return response.data; // Retorna o objeto data que contém id, cod, description, etc
    },
    onSuccess: (createdData, variables) => {
      // Invalida a query específica da empresa para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['type-occurrences', variables.companyId] });
      toast.success(t('create.success'));
    },
    onError: (error) => {
      console.error('Erro ao criar tipo de ocorrência:', error);
      toast.error(t('create.error'));
    },
  });
}

export function useUpdateTypeOccurrenceMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.TypeOccurrence");

  return useMutation({
    mutationFn: async ( data: TypeOccurrence): Promise<TypeOccurrence> => {
      const { data: response } = await api.put(`/typeOccorrence`, data);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['type-occurrences'] });
      toast.success(t('update.success'));
    },
    onError: (error) => {
      console.error('Erro ao atualizar tipo de ocorrência:', error);
      toast.error(t('update.error'));
    },
  });
}

export function useDeleteTypeOccurrenceMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.TypeOccurrence");

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/typeOccorrence/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['type-occurrences'] });
      toast.success(t('delete.success'));
    },
    onError: (error) => {
      console.error('Erro ao eliminar tipo de ocorrência:', error);
      toast.error(t('delete.error'));
    },
  });
}


