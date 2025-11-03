import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Equipment } from "../../types/domain";
import { z } from "zod";
import { createEquipmentSchema } from "../schema/schema-equipment";
import { toast } from "sonner";

type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;

const QUERY_KEY = ["equipment"] as const;

export function useEquipment() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Equipment[]> => {
      const response = await api.get("/equipment");
      return response.data as Equipment[];
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation<Equipment, unknown, CreateEquipmentInput>({
    mutationFn: async (data: CreateEquipmentInput): Promise<Equipment> => {
      const response = await api.post("/equipment", data);
      return response.data as Equipment;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<Equipment[] | undefined>(QUERY_KEY, (old) => {
        const current = old ?? [];
        return [created, ...current];
      });
      toast.success("Equipamento criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar equipamento");
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>> }): Promise<Equipment> => {
      const response = await api.put(`/equipment/${id}`, data);
      return response.data as Equipment;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Equipment[] | undefined>(QUERY_KEY, (old) => {
        if (!old) return [updated];
        return old.map((item) => (item.id === updated.id ? { ...item, ...updated } : item));
      });
      toast.success("Equipamento atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar equipamento");
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/equipment/${id}`);
    },
    onSuccess: (_void, id) => {
      queryClient.setQueryData<Equipment[] | undefined>(QUERY_KEY, (old) => {
        if (!old) return old;
        return old.filter((e) => e.id !== id);
      });
      toast.success("Equipamento excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir equipamento");
    },
  });
}

