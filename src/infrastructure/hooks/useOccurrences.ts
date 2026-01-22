import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { api } from '@/infrastructure/utils/api';
import type { Occorrence } from '@/infrastructure/types/domain';

export function useOccurrences(companyId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['occurrences', companyId],
    queryFn: async (): Promise<Occorrence[]> => {
      if (!companyId) return [];
      const { data } = await api.get(`/occorrence/getAllByCompany/${companyId}`);
      return data?.data ?? data ?? [];
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
}



export function useCreateOccurrenceMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Occurrences");

  return useMutation({
    mutationFn: async (data: Omit<Occorrence, 'id' | 'createdAt' | 'updatedAt'>): Promise<Occorrence> => {
      const { data: response } = await api.post('/occorrence/create', data);
      return response?.data ?? response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      toast.success(t('create.success'));
    },
    onError: (error) => {
      console.error('Erro ao criar ocorrência:', error);
      toast.error(t('create.error'));
    },
  });
}

export function useUpdateOccurrenceMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Occurrences");

  return useMutation({
    mutationFn: async (data: Occorrence): Promise<Occorrence> => {
      const { data: response } = await api.put('/occorrence', data);
      return response?.data ?? response;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      if (updated.id) {
        queryClient.invalidateQueries({ queryKey: ['occurrence', updated.id] });
      }
      toast.success(t('update.success'));
    },
    onError: (error) => {
      console.error('Erro ao atualizar ocorrência:', error);
      toast.error(t('update.error'));
    },
  });
}

export function useDeleteOccurrenceMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Occurrences");

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/occorrence/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      toast.success(t('delete.success'));
    },
    onError: (error) => {
      console.error('Erro ao eliminar ocorrência:', error);
      toast.error(t('delete.error'));
    },
  });
}

export function useOccurrencesByDate(companyId: string, date: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['occurrences', 'date', companyId, date],
    queryFn: async (): Promise<Occorrence[]> => {
      if (!companyId || !date) return [];
      const encodedDate = encodeURIComponent(date);
      const { data } = await api.get(`/occorrence/getByDate/${companyId}/${encodedDate}`);
      return data?.data ?? data ?? [];
    },
    enabled: !!companyId && !!date && (options?.enabled ?? true),
  });
}

export function useOccurrencesBySiteId(companyId: string, siteId: string) {
  return useQuery({
    queryKey: ['occurrences', 'siteId', companyId, siteId],
    queryFn: async (): Promise<Occorrence[]> => {
      if (!companyId || !siteId) return [];
      const { data } = await api.get(`/occorrence/getBySiteId/${companyId}/${siteId}`);
      return data?.data ?? data ?? [];
    },
    enabled: !!companyId && !!siteId,
  });
}

export function useOccurrencesByStatus(companyId: string, status: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['occurrences', 'status', companyId, status],
    queryFn: async (): Promise<Occorrence[]> => {
      if (!companyId || !status) return [];
      const { data } = await api.get(`/occorrence/getByStatus/${companyId}/${status}`);
      return data?.data ?? data ?? [];
    },
    enabled: !!companyId && !!status && (options?.enabled ?? true),
  });
}


