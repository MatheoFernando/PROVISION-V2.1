import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { api } from '@/infrastructure/utils/api';
import type { Round } from '@/infrastructure/types/domain';

export function useRounds() {
    return useQuery({
        queryKey: ['rounds'],
        queryFn: async (): Promise<Round[]> => {
            const { data } = await api.get('/round/getAll');
            return data?.data ?? data;
        },
    });
}

export function useRound(id: string) {
    return useQuery({
        queryKey: ['round', id],
        queryFn: async (): Promise<Round | null> => {
            const { data } = await api.get(`/round/getAll`, { params: { id } });
            const list = data?.data ?? [];
            return Array.isArray(list) ? (list.find((r: any) => r.id === id) ?? null) : null;
        },
        enabled: !!id,
    });
}

export function useCreateRoundMutation() {
    const queryClient = useQueryClient();
    const t = useTranslations("Hooks.Rounds");

    return useMutation({
        mutationFn: async (data: Omit<Round, 'id' | 'createdAt' | 'updatedAt'>): Promise<Round> => {
            const { data: response } = await api.post('/round/create', data);
            return response?.data ?? response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rounds'] });
            toast.success(t('create.success'));
        },
        onError: (error) => {
            console.error('Erro ao criar ronda:', error);
            toast.error(t('create.error'));
        },
    });
}

export function useUpdateRoundMutation() {
    const queryClient = useQueryClient();
    const t = useTranslations("Hooks.Rounds");

    return useMutation({
        mutationFn: async (data: Round): Promise<Round> => {
            const { data: response } = await api.put('/round', data);
            return response?.data ?? response;
        },
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['rounds'] });
            if (updated.id) {
                queryClient.invalidateQueries({ queryKey: ['round', updated.id] });
            }
            toast.success(t('update.success'));
        },
        onError: (error) => {
            console.error('Erro ao atualizar ronda:', error);
            toast.error(t('update.error'));
        },
    });
}

export function useDeleteRoundMutation() {
    const queryClient = useQueryClient();
    const t = useTranslations("Hooks.Rounds");

    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            await api.delete(`/round/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rounds'] });
            toast.success(t('delete.success'));
        },
        onError: (error) => {
            console.error('Erro ao eliminar ronda:', error);
            toast.error(t('delete.error'));
        },
    });
}
