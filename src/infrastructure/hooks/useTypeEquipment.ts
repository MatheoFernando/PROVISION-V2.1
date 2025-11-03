import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { TypeEquipment } from "../../types/domain";
import { toast } from "sonner";

const QUERY_KEY = ["type-equipment"] as const;

export function useTypeEquipment() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<TypeEquipment[]> => {
      const { data } = await api.get("/typeEquipment/getAll");
      return (data?.data ?? data) as TypeEquipment[];
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}

export function useCreateTypeEquipment() {
  const queryClient = useQueryClient();
  
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
      toast.success("Tipo de equipamento criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar tipo de equipamento");
    },
  });
}

export function useUpdateTypeEquipment() {
  const queryClient = useQueryClient();
  
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
      toast.success("Tipo de equipamento atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar tipo de equipamento");
    },
  });
}

export function useDeleteTypeEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/typeEquipment/${id}`);
    },
    onSuccess: (_void, id) => {
      queryClient.setQueryData<TypeEquipment[] | undefined>(QUERY_KEY, (old) => {
        if (!old) return old;
        return old.filter((item) => item.id !== id);
      });
      toast.success("Tipo de equipamento removido com sucesso");
    },
    onError: () => {
      toast.error("Erro ao remover tipo de equipamento");
    },
  });
}
