import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Equipment } from "../../types/domain";
import { z } from "zod";
import { createEquipmentSchema } from "../schema/schema-equipment";

type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;

export function useEquipment() {
  return useQuery({
    queryKey: ["equipment"],
    queryFn: async (): Promise<Equipment[]> => {
      const response = await api.get("/equipment");
      return response.data;
    },
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation<Equipment, unknown, CreateEquipmentInput>({
    mutationFn: async (data: CreateEquipmentInput): Promise<Equipment> => {
      const response = await api.post("/equipment", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>> }): Promise<Equipment> => {
      const response = await api.put(`/equipment/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/equipment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

