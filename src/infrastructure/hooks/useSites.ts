import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import type { Site } from "../types/domain";
import type { CreateSite } from "../schema/schema-sites";

export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async (): Promise<Site[]> => {
      const response = await api.get("/site/getAll");
      return response.data;
    },
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  
  return useMutation<Site, unknown, CreateSite>({
    mutationFn: async (data) => {
      const response = await api.post("/site/create", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Site, 'id' | 'createdAt' | 'updatedAt'>> }): Promise<Site> => {
      const response = await api.put(`/site`, { id, ...data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/site/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}

