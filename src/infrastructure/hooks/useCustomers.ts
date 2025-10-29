import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Customer } from "../../types/domain";

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
    mutationFn: async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
      const response = await api.post("/customer/create", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
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
