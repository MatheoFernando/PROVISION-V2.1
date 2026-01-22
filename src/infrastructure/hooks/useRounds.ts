import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { api } from '@/infrastructure/utils/api';
import type { Round } from '@/infrastructure/types/domain';

interface RoundsQueryOptions {
    enabled?: boolean;
}

export function useRounds(companyId?: string, options?: RoundsQueryOptions) {
    return useQuery({
        queryKey: ['rounds', companyId],
        queryFn: async (): Promise<Round[]> => {
            if (!companyId) return [];
            const { data } = await api.get(`/round/GetAllByCompany/${companyId}`);
            return data?.data ?? data ?? [];
        },
        enabled: (options?.enabled ?? true) && !!companyId,
    });
}

export function useRound(id: string) {
    return useQuery({
        queryKey: ['round', id],
        queryFn: async (): Promise<Round | null> => {
            const { data } = await api.get(`/round/getById/${id}`);
            return data?.data ?? data ?? null;
        },
        enabled: !!id,
    });
}

export function useRoundsByDate(companyId: string, date: string, options?: RoundsQueryOptions) {
    return useQuery({
        queryKey: ['rounds', 'by-date', companyId, date],
        queryFn: async (): Promise<Round> => {
            const { data } = await api.get(`/round/getBydate/${companyId}/${date}`);
            return data?.data ?? data ?? null;
        },
        enabled: (options?.enabled ?? true) && !!companyId && !!date,
    });
}

export function useRoundsByNumber(companyId: string, number: number, options?: RoundsQueryOptions) {
    return useQuery({
        queryKey: ['rounds', 'by-number', companyId, number],
        queryFn: async (): Promise<Round> => {
            const { data } = await api.get(`/round/getByNumberRound/${companyId}/${number}`);
            return data?.data ?? data ?? null;
        },
        enabled: (options?.enabled ?? true) && !!companyId && !!number,
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
