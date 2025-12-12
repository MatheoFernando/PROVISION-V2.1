import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { api } from '@/infrastructure/utils/api';
import type { ItemInspectionRound } from '@/infrastructure/types/domain';

export function useItemInspectionRounds() {
    return useQuery({
        queryKey: ['item-inspection-rounds'],
        queryFn: async (): Promise<ItemInspectionRound[]> => {
            const { data } = await api.get('/item-inspection-round/getAll');
            return data?.data ?? data;
        },
    });
}

export function useCreateItemInspectionRoundMutation() {
    const queryClient = useQueryClient();
    const t = useTranslations("Hooks.ItemInspectionRounds");

    return useMutation({
        mutationFn: async (data: Omit<ItemInspectionRound, 'id' | 'createdAt' | 'updatedAt'>): Promise<ItemInspectionRound> => {
            const { data: response } = await api.post('/item-inspection-round/create', data);
            return response?.data ?? response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['item-inspection-rounds'] });
            toast.success(t('create.success'));
        },
        onError: (error) => {
            console.error('Erro ao criar item de inspeção:', error);
            toast.error(t('create.error'));
        },
    });
}

export function useUpdateItemInspectionRoundMutation() {
    const queryClient = useQueryClient();
    const t = useTranslations("Hooks.ItemInspectionRounds");

    return useMutation({
        mutationFn: async (data: ItemInspectionRound): Promise<ItemInspectionRound> => {
            const { data: response } = await api.put('/item-inspection-round', data);
            return response?.data ?? response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['item-inspection-rounds'] });
            toast.success(t('update.success'));
        },
        onError: (error) => {
            console.error('Erro ao atualizar item de inspeção:', error);
            toast.error(t('update.error'));
        },
    });
}

export function useDeleteItemInspectionRoundMutation() {
    const queryClient = useQueryClient();
    const t = useTranslations("Hooks.ItemInspectionRounds");

    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            await api.delete(`/item-inspection-round/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['item-inspection-rounds'] });
            toast.success(t('delete.success'));
        },
        onError: (error) => {
            console.error('Erro ao eliminar item de inspeção:', error);
            toast.error(t('delete.error'));
        },
    });
}
