import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { toast } from "sonner";
import { Address } from "../types/domain";

export function useAddresses(companyId?: string) {
  return useQuery({
    queryKey: ["addresses", companyId],
    queryFn: async (): Promise<Address[]> => {
      if (!companyId) return [];
      const response = await api.get("/address/getAll");
      return response.data || [];
    },
    enabled: !!companyId,
  });
}

export function useAddressesByHouseHold(houseHold: string) {
  return useQuery({
    queryKey: ["addresses", "houseHold", houseHold],
    queryFn: async (): Promise<Address[]> => {
      const { data } = await api.get(`/address/getByHouseHold`, { params: { houseHold } });
      return (data?.data ?? []) as Address[];
    },
    enabled: !!houseHold,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<Address> => {
      const response = await api.post("/address/create", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Endereço criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao criar endereço");
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Omit<Address, 'id' | 'createdAt' | 'updatedAt'>> & { id: string }): Promise<Address> => {
      const response = await api.put("/address", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Endereço atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao atualizar endereço");
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/address/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Endereço excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao excluir endereço");
    },
  });
}



