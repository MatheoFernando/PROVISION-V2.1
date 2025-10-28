import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/infrastructure/utils/api';
import { mockTypeOccurrences } from '@/infrastructure/schema/schema-type-occurrence';
import type { TypeOccurrence, CreateTypeOccurrence, UpdateTypeOccurrence } from '@/infrastructure/schema/schema-type-occurrence';

export function useTypeOccurrences() {
  return useQuery({
    queryKey: ['type-occurrences'],
    queryFn: async (): Promise<TypeOccurrence[]> => {
      try {
        const { data } = await api.get('/type-occurrence/GetAll');
        return data?.data ?? [];
      } catch {
        return mockTypeOccurrences;
      }
    },
    initialData: mockTypeOccurrences,
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

  return useMutation({
    mutationFn: async (data: CreateTypeOccurrence): Promise<TypeOccurrence> => {
      const { data: response } = await api.post('/type-occurrence/Create', data);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['type-occurrences'] });
      toast.success('Tipo de ocorrência criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar tipo de ocorrência:', error);
      toast.error('Erro ao criar tipo de ocorrência. Tente novamente.');
    },
  });
}

export function useUpdateTypeOccurrenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTypeOccurrence }): Promise<TypeOccurrence> => {
      const { data: response } = await api.put(`/type-occurrence/Update/${id}`, data);
      return response?.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['type-occurrences'] });
      queryClient.invalidateQueries({ queryKey: ['type-occurrence', id] });
      toast.success('Tipo de ocorrência atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar tipo de ocorrência:', error);
      toast.error('Erro ao atualizar tipo de ocorrência. Tente novamente.');
    },
  });
}

export function useDeleteTypeOccurrenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/type-occurrence/Delete/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['type-occurrences'] });
      toast.success('Tipo de ocorrência excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir tipo de ocorrência:', error);
      toast.error('Erro ao excluir tipo de ocorrência. Tente novamente.');
    },
  });
}


