import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/infrastructure/utils/api';
import { mockOccurrences } from '@/infrastructure/schema/schema-occurrence';
import type { Occurrence, CreateOccurrence, UpdateOccurrence } from '@/infrastructure/schema/schema-occurrence';

export function useOccurrences() {
  return useQuery({
    queryKey: ['occurrences'],
    queryFn: async (): Promise<Occurrence[]> => {
      try {
        const { data } = await api.get('/occurrence/GetAll');
        return data?.data ?? [];
      } catch {
        // Sempre retorna mock quando não há dados da API
        return mockOccurrences;
      }
    },
    // Sempre mostra dados mockados imediatamente
    initialData: mockOccurrences,
  });
}

export function useOccurrence(id: string) {
  return useQuery({
    queryKey: ['occurrence', id],
    queryFn: async (): Promise<Occurrence | null> => {
      const { data } = await api.get(`/occurrence/GetById/${id}`);
      return data?.data ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateOccurrenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOccurrence): Promise<Occurrence> => {
      const { data: response } = await api.post('/occurrence/Create', data);
      return response?.data;
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
    mutationFn: async ({ id, data }: { id: string; data: UpdateOccurrence }): Promise<Occurrence> => {
      const { data: response } = await api.put(`/occurrence/Update/${id}`, data);
      return response?.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      queryClient.invalidateQueries({ queryKey: ['occurrence', id] });
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
      await api.delete(`/occurrence/Delete/${id}`);
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


