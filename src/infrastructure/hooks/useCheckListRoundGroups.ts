import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { api } from '@/infrastructure/utils/api';
import type { CheckListRoundGroup } from '@/infrastructure/types/domain';

export function useCheckListRoundGroups(companyId?: string, roundId?: string) {
    return useQuery({
        queryKey: ['checklist-round-groups', companyId, roundId],
        queryFn: async (): Promise<CheckListRoundGroup[]> => {
            if (!companyId) return [];
            const { data } = await api.get(`/checklist-round-group/GetAllbyCompany/${companyId}`);
            const list = data?.data ?? data ?? [];
            if (roundId) {
                return list.filter((item: CheckListRoundGroup) => item.roundId === roundId);
            }
            return list;
        },
        enabled: !!companyId
    });
}

export function useCheckListRoundGroup(id: string) {
    return useQuery({
        queryKey: ['checklist-round-group', id],
        queryFn: async (): Promise<CheckListRoundGroup | null> => {
            const { data } = await api.get(`/checklist-round-group/${id}`);
            return data?.data ?? data ?? null;
        },
        enabled: !!id,
    });
}

export function useCreateCheckListRoundGroupMutation() {
    const queryClient = useQueryClient();
    const t = useTranslations("Hooks.CheckListRoundGroups");

    return useMutation({
        mutationFn: async (data: Omit<CheckListRoundGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<CheckListRoundGroup> => {
            const { data: response } = await api.post('/checklist-round-group/create', data);
            return response?.data ?? response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['checklist-round-groups', variables.roundId] });
            toast.success(t('create.success'));
        },
        onError: (error) => {
            console.error('Erro ao criar avaliação:', error);
            toast.error(t('create.error'));
        },
    });
}

export function useUpdateCheckListRoundGroupMutation() {
    const queryClient = useQueryClient();
    const t = useTranslations("Hooks.CheckListRoundGroups");

    return useMutation({
        mutationFn: async (data: CheckListRoundGroup): Promise<CheckListRoundGroup> => {
            const { data: response } = await api.put('/checklist-round-group', data);
            return response?.data ?? response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['checklist-round-groups', variables.roundId] });
            toast.success(t('update.success'));
        },
        onError: (error) => {
            console.error('Erro ao atualizar avaliação:', error);
            toast.error(t('update.error'));
        },
    });
}

export function useDeleteCheckListRoundGroupMutation() {
    const queryClient = useQueryClient();
    const t = useTranslations("Hooks.CheckListRoundGroups");

    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            await api.delete(`/checklist-round-group/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklist-round-groups'] });
            toast.success(t('delete.success'));
        },
        onError: (error) => {
            console.error('Erro ao eliminar avaliação:', error);
            toast.error(t('delete.error'));
        },
    });
}
