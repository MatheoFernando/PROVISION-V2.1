import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Employee } from "../types/domain";
import { z } from "zod";
import { createEmployeeSchema } from "../schema/schema-employees";
import { toast } from "sonner";

type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export function useEmployees(companyId?: string) {
  return useQuery({
    queryKey: ["employees", companyId],
    enabled: Boolean(companyId),
    queryFn: async (): Promise<Employee[]> => {
      const response = await api.get(`/employee/getAll/${companyId}`);
      return response.data.data;
    },
  });
}

export function useEmployeeById(id?: string, companyId?: string) {
  return useQuery({
    queryKey: ["employee", id, companyId],
    enabled: Boolean(id && companyId),
    queryFn: async (): Promise<Employee | null> => {
      const response = await api.get(`/employee/getAll/${companyId}`);
      const list: Employee[] = response.data.data ?? [];
      return (list || []).find((e: any) => e?.id === id) ?? null;
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation<Employee, unknown, CreateEmployeeInput>({
    mutationFn: async (data: CreateEmployeeInput): Promise<Employee> => {
      const response = await api.post("/employee/create", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.refetchQueries({ queryKey: ["employees"], type: 'active' });
      toast.success('Funcionário criado com sucesso!');
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>> }): Promise<Employee> => {
      const response = await api.put(`/employee/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.refetchQueries({ queryKey: ["employees"], type: 'active' });
      toast.success('Funcionário atualizado com sucesso!');
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/employee/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.refetchQueries({ queryKey: ["employees"], type: 'active' });
      toast.success('Funcionário excluído com sucesso!');
    },
  });
}

