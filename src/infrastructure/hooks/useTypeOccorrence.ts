import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { toast } from "sonner";
import { TypeOccorrence } from "../types/domain";

export function useTypeOccorrence() {
  return useQuery({
    queryKey: ["type-occorrence"],
    queryFn: async (): Promise<TypeOccorrence[]> => {
      const { data } = await api.get("/typeOccorrence/getAll");
      return (data?.data ?? data) as TypeOccorrence[];
    },
  });
}

export function useTypeOccorrenceById(id?: string) {
  return useQuery({
    queryKey: ["type-occorrence", id],
    queryFn: async (): Promise<TypeOccorrence | null> => {
      if (!id) return null;
      const { data } = await api.get(`/typeOccorrence/getById/${id}`);
      return data || null;
    },
    enabled: !!id,
  });
}

export function useCreateTypeOccorrence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<TypeOccorrence, 'id' | 'createdAt' | 'updatedAt'>): Promise<TypeOccorrence> => {
      const { data } = await api.post("/typeOccorrence/create", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["type-occorrence"] });
      toast.success("Tipo de ocorrência criado!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar tipo de ocorrência");
    },
  });
}

export function useUpdateTypeOccorrence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Omit<TypeOccorrence, 'createdAt' | 'updatedAt'>> & { id: string }): Promise<TypeOccorrence> => {
      const { data } = await api.put("/typeOccorrence", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["type-occorrence"] });
      toast.success("Tipo de ocorrência atualizado!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar tipo de ocorrência");
    },
  });
}

export function useDeleteTypeOccorrence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/typeOccorrence/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["type-occorrence"] });
      toast.success("Tipo de ocorrência excluído!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao excluir tipo de ocorrência");
    },
  });
}






