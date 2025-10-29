import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Container } from "../../types/domain";

export function useContainers() {
  return useQuery({
    queryKey: ["containers"],
    queryFn: async (): Promise<Container[]> => {
      const response = await api.get("/container/getAll");
      return response.data;
    },
  });
}

export function useCreateContainer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>): Promise<Container> => {
      const response = await api.post("/container/create", data);
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Container, 'id' | 'createdAt' | 'updatedAt'>> }): Promise<Container> => {
      const response = await api.put(`/container`, { id, ...data });
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
      await api.delete(`/container/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
    },
  });
}
