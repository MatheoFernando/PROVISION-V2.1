import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { TypeEquipment, CreateTypeEquipment, UpdateTypeEquipment } from "../schema/schema-type-equipment";

export function useTypeEquipment() {
  return useQuery({
    queryKey: ["type-equipment"],
    queryFn: async (): Promise<TypeEquipment[]> => {
      // Mock data para tipos de equipamento
      const mockTypeEquipment: TypeEquipment[] = [
        {
          id: "type-1",
          name: "Desktop",
          description: "Computadores de mesa para uso em escritório",
          companyId: "company-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "type-2",
          name: "Notebook",
          description: "Computadores portáteis para mobilidade",
          companyId: "company-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "type-3",
          name: "Servidor",
          description: "Equipamentos para processamento e armazenamento de dados",
          companyId: "company-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "type-4",
          name: "Impressora",
          description: "Equipamentos para impressão de documentos",
          companyId: "company-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockTypeEquipment;
    },
  });
}

export function useCreateTypeEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTypeEquipment): Promise<TypeEquipment> => {
      const response = await api.post("/type-equipment", data);
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
    mutationFn: async ({ id, data }: { id: string; data: UpdateTypeEquipment }): Promise<TypeEquipment> => {
      const response = await api.put(`/type-equipment/${id}`, data);
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
      await api.delete(`/type-equipment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["type-equipment"] });
    },
  });
}
