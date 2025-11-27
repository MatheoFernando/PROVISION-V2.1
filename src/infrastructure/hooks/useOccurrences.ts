import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/infrastructure/utils/api';
import type { Occorrence } from '@/infrastructure/types/domain';

export function useOccurrences() {
  return useQuery({
    queryKey: ['occurrences'],
    queryFn: async (): Promise<Occorrence[]> => {
      const { data } = await api.get('/occorrence/getAll');
      return data?.data ?? data;
    },
  });
}

export function useOccurrence(id: string) {
  return useQuery({
    queryKey: ['occurrence', id],
    queryFn: async (): Promise<Occorrence | null> => {
      const { data } = await api.get(`/occorrence/getAll`, { params: { id } });
      const list = data?.data ?? [];
      return Array.isArray(list) ? (list.find((o: any) => o.id === id) ?? null) : null;
    },
    enabled: !!id,
  });
}

export function useCreateOccurrenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Occorrence, 'id' | 'createdAt' | 'updatedAt'>): Promise<Occorrence> => {
      const { data: response } = await api.post('/occorrence/create', data);
      return response?.data ?? response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      toast.success('Ocorrência criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar ocorrência:', error);
      toast.error('Erro ao criar ocorrência. Tente novamente.');
    },
  });
}

export function useUpdateOccurrenceMutation() {
  const queryClient = useQueryClient();

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
      toast.success('Ocorrência atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar ocorrência:', error);
      toast.error('Erro ao atualizar ocorrência. Tente novamente.');
    },
  });
}

export function useDeleteOccurrenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/occorrence/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      toast.success('Ocorrência excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir ocorrência:', error);
      toast.error('Erro ao excluir ocorrência. Tente novamente.');
    },
  });
}

export function useOccurrencesByDate(date: string) {
  return useQuery({
    queryKey: ['occurrences', 'date', date],
    queryFn: async (): Promise<Occorrence[]> => {
      const { data } = await api.get('/occorrence/getByDate', { params: { date } });
      return data?.data ?? data;
    },
    enabled: Boolean(date),
  });
}

export function useOccurrencesBySiteId(siteId: string) {
  return useQuery({
    queryKey: ['occurrences', 'siteId', siteId],
    queryFn: async (): Promise<Occorrence[]> => {
      const { data } = await api.get('/occorrence/getBySiteId', { params: { siteId } });
      return data?.data ?? data;
    },
    enabled: Boolean(siteId),
  });
}

export function useOccurrencesByStatus(status: string) {
  return useQuery({
    queryKey: ['occurrences', 'status', status],
    queryFn: async (): Promise<Occorrence[]> => {
      const { data } = await api.get('/occorrence/getByStatus', { params: { status } });
      return data?.data ?? data;
    },
    enabled: Boolean(status),
  });
}


