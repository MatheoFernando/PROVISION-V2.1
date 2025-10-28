import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Equipment, CreateEquipment, UpdateEquipment } from "../schema/schema-equipment";
import { mockEquipments } from "../schema/schema-equipment";

export function useEquipment() {
  return useQuery({
    queryKey: ["equipment"],
    queryFn: async (): Promise<Equipment[]> => {
      // Mock data para equipamentos
      const mockData = mockEquipments;
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockData;
    },
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateEquipment): Promise<Equipment> => {
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
    mutationFn: async ({ id, data }: { id: string; data: UpdateEquipment }): Promise<Equipment> => {
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

