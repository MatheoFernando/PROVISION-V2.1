import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { toast } from "sonner";
import { Sector } from "../types/domain";

export function useSectors() {
  return useQuery({
    queryKey: ["sectors"],
    queryFn: async (): Promise<Sector[]> => {
      const { data } = await api.get("/sector/getAll");
      return (data?.data ?? data) as Sector[];
    },
  });
}

export function useSectorById(id?: string) {
  return useQuery({
    queryKey: ["sector", id],
    queryFn: async (): Promise<Sector | null> => {
      if (!id) return null;
      const { data } = await api.get(`/sector/getById/${id}`);
      return data || null;
    },
    enabled: !!id,
  });
}

export function useCreateSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sector> => {
      const { data } = await api.post("/sector/create", payload);
      return data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData(["sectors"], (old: Sector[] = []) => {
        const filtered = old.filter(s => s.id !== created.id);
        return [created, ...filtered];
      });
      toast.success("Setor criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar setor");
    },
  });
}

export function useUpdateSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Omit<Sector, 'createdAt' | 'updatedAt'>> & { id: string }): Promise<Sector> => {
      const { data } = await api.put("/sector", payload);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["sectors"], (old: Sector[] = []) => {
        return old.map(s => s.id === updated.id ? updated : s);
      });
      toast.success("Setor atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar setor");
    },
  });
}

export function useDeleteSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/sector/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      toast.success("Setor excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao excluir setor");
    },
  });
}