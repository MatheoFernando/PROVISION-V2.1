import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { TypeEquipment } from "../../types/domain";

export function useTypeEquipment() {
  return useQuery({
    queryKey: ["type-equipment"],
    queryFn: async (): Promise<TypeEquipment[]> => {
      const { data } = await api.get("/typeEquipment/getAll");
      return (data?.data ?? data) as TypeEquipment[];
    },
  });
}

export function useCreateTypeEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<TypeEquipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<TypeEquipment> => {
      const response = await api.post("/typeEquipment/create", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["type-equipment"] });
    },
  });
}

export function useUpdateTypeEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<TypeEquipment, 'id' | 'createdAt' | 'updatedAt'>> }): Promise<TypeEquipment> => {
      const response = await api.put(`/typeEquipment`, { id, ...data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["type-equipment"] });
    },
  });
}

export function useDeleteTypeEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/typeEquipment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["type-equipment"] });
    },
  });
}
