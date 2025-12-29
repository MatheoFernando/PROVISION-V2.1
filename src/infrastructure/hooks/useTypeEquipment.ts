import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { TypeEquipment } from "../types/domain";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const QUERY_KEY = ["type-equipment"] as const;

export function useTypeEquipment(companyId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, companyId],
    queryFn: async (): Promise<TypeEquipment[]> => {
      if (!companyId) return [];
      const { data } = await api.get(`/typeEquipment/getAllbyCompany/${companyId}`);
      return (data?.data ?? data) as TypeEquipment[];
    },
    enabled: !!companyId,
  });
}

export function useTypeEquipmentById(id?: string) {
  return useQuery({
    queryKey: ["type-equipment", id],
    queryFn: async (): Promise<TypeEquipment | null> => {
      if (!id) return null;
      const { data } = await api.get(`/typeEquipment/getById/${id}`);
      return data || null;
    },
    enabled: !!id,
  });
}

export function useCreateTypeEquipment() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.TypeEquipment");

  return useMutation({
    mutationFn: async (data: Omit<TypeEquipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<TypeEquipment> => {
      const response = await api.post("/typeEquipment/create", data);
      return response.data as TypeEquipment;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<TypeEquipment[] | undefined>(QUERY_KEY, (old) => {
        const current = old ?? [];
        return [created, ...current];
      });
      queryClient.refetchQueries({ queryKey: QUERY_KEY, type: "active" });
      toast.success(t("create.success"));
    },
    onError: () => {
      toast.error(t("create.error"));
    },
  });
}

export function useUpdateTypeEquipment() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.TypeEquipment");

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<TypeEquipment, 'id' | 'createdAt' | 'updatedAt'>> }): Promise<TypeEquipment> => {
      const response = await api.put(`/typeEquipment`, { id, ...data });
      return response.data as TypeEquipment;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<TypeEquipment[] | undefined>(QUERY_KEY, (old) => {
        if (!old) return [updated];
        return old.map((item) => (item.id === updated.id ? { ...item, ...updated } : item));
      });
      queryClient.refetchQueries({ queryKey: QUERY_KEY, type: "active" });
      toast.success(t("update.success"));
    },
    onError: () => {
      toast.error(t("update.error"));
    },
  });
}

export function useDeleteTypeEquipment() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.TypeEquipment");

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/typeEquipment/${id}`);
    },
    onSuccess: (_void, id) => {
      queryClient.setQueryData<TypeEquipment[] | undefined>(QUERY_KEY, (old) => {
        if (!old) return old;
        return old.filter((item) => item.id !== id);
      });
      queryClient.refetchQueries({ queryKey: QUERY_KEY, type: "active" });
      toast.success(t("delete.success"));
    },
    onError: () => {
      toast.error(t("delete.error"));
    },
  });
}
