import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { toast } from "sonner";
import { Area } from "../../types/domain";

export function useAreas() {
  return useQuery({
    queryKey: ["areas"],
    queryFn: async (): Promise<Area[]> => {
      const { data } = await api.get("/area/getAll");
      return (data?.data ?? data) as Area[];
    },
  });
}

export function useAreasByBossId(employeeId: string) {
  return useQuery({
    queryKey: ["areas", "boss", employeeId],
    queryFn: async (): Promise<Area[]> => {
      const { data } = await api.get("/area/getByBossId", { params: { employeeId } });
      return (data?.data ?? data) as Area[];
    },
    enabled: Boolean(employeeId),
  });
}

export function useCreateArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>): Promise<Area> => {
      const { data } = await api.post("/area/create", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar área");
    },
  });
}

export function useUpdateArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Omit<Area, 'createdAt' | 'updatedAt'>> & { id: string }): Promise<Area> => {
      const { data } = await api.put("/area", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar área");
    },
  });
}

export function useDeleteArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/area/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao excluir área");
    },
  });
}


