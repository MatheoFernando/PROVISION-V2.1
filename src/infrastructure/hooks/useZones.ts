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

export function useZoneById(id?: string) {
  return useQuery({
    queryKey: ["zone", id],
    queryFn: async (): Promise<Zone | null> => {
      if (!id) return null;
      const { data } = await api.get(`/zone/getById/${id}`);
      return data || null;
    },
    enabled: !!id,
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation<Zone, unknown, CreateZonePayload>({
    mutationFn: async (payload: CreateZonePayload): Promise<Zone> => {
      const { data } = await api.post("/zone/create", payload);
      return data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData(["zones"], (old: Zone[] = []) => {
        const filtered = old.filter(z => z.id !== created.id);
        return [created, ...filtered];
      });
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
    onSuccess: (updated) => {
      queryClient.setQueryData(["zones"], (old: Zone[] = []) => {
        return old.map(z => z.id === updated.id ? updated : z);
      });
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