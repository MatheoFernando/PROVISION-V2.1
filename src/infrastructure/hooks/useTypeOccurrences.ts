import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { api } from '@/infrastructure/utils/api';
import type { TypeOccurrence } from '@/infrastructure/schema/schema-type-occurrence';

export function useTypeOccurrences() {
  return useQuery({
    queryKey: ['type-occurrences'],
    queryFn: async (): Promise<TypeOccurrence[]> => {
      try {
        const { data } = await api.get('/type-occurrence/GetAll');
        return data?.data ?? [];
      } catch {
        return [];
      }
    },

  });
}

export function useTypeOccurrence(id: string) {
  return useQuery({
    queryKey: ['type-occurrence', id],
    queryFn: async (): Promise<TypeOccurrence | null> => {
      const { data } = await api.get(`/type-occurrence/GetById/${id}`);
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
      const { data: response } = await api.post('/type-occurrence/Create', data);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['type-occurrences'] });
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
    mutationFn: async ({ id, data }: { id: string; data: TypeOccurrence }): Promise<TypeOccurrence> => {
      const { data: response } = await api.put(`/type-occurrence/Update/${id}`, data);
      return response?.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['type-occurrences'] });
      queryClient.invalidateQueries({ queryKey: ['type-occurrence', id] });
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
      await api.delete(`/type-occurrence/Delete/${id}`);
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


