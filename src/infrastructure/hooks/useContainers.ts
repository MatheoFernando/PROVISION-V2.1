import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Container, CreateContainer, UpdateContainer } from "../schema/schema-containers";
import { defaultContainers } from "../schema/schema-containers";

export function useContainers() {
  return useQuery({
    queryKey: ["containers"],
    queryFn: async (): Promise<Container[]> => {
      // Mock data para containers
      const mockData = defaultContainers;
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockData;
    },
  });
}

export function useCreateContainer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateContainer): Promise<Container> => {
      const response = await api.post("/containers", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
    },
  });
}

export function useUpdateContainer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateContainer }): Promise<Container> => {
      const response = await api.put(`/containers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
    },
  });
}

export function useDeleteContainer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/containers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
    },
  });
}
