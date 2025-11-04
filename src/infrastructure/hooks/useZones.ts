import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { toast } from "sonner";
import { Zone, CreateZonePayload } from "../types/domain";

export function useZones() {
  return useQuery({
    queryKey: ["zones"],
    queryFn: async (): Promise<Zone[]> => {
      const { data } = await api.get("/zone/getAll");
      return (data?.data ?? data) as Zone[];
    },
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation<Zone, unknown, CreateZonePayload>({
    mutationFn: async (payload: CreateZonePayload): Promise<Zone> => {
      const { data } = await api.post("/zone/create", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success("Zona criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar zona");
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Omit<Zone, 'createdAt' | 'updatedAt'>> & { id: string }): Promise<Zone> => {
      const { data } = await api.put("/zone", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success("Zona atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar zona");
    },
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/zone/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success("Zona excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao excluir zona");
    },
  });
}






