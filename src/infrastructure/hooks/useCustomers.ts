import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Customer } from "../../types/domain";
import { toast } from "sonner";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async (): Promise<Customer[]> => {
      const response = await api.get("/customer/getAll");
      return response.data.data;
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Customer): Promise<Customer> => {
      const response = await api.post("/customer/create", data);
      const createdCustomer = response.data?.data || response.data; 
      return createdCustomer as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente criado com sucesso!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Erro desconhecido ao criar cliente";
      toast.error(message);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>> }): Promise<Customer> => {
      const response = await api.put(`/customer`, { id, ...data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Erro desconhecido ao atualizar cliente";
      toast.error(message);
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/customer/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente deletado com sucesso!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Erro desconhecido ao deletar cliente";
      toast.error(message);
    },
  });
}

export function useSearchCustomersByName(name: string) {
  return useQuery({
    queryKey: ["customers", "name", name],
    queryFn: async (): Promise<Customer[]> => {
      const response = await api.get(`/customer/name`, { params: { name } });
      return response.data.data ?? response.data;
    },
    enabled: Boolean(name && name.trim().length > 0),
  });
}