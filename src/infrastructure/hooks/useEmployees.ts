import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Employee } from "../types/domain";
import { z } from "zod";
import { createEmployeeSchema } from "../schema/schema-employees";

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

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation<Employee, unknown, CreateEmployeeInput>({
    mutationFn: async (data: CreateEmployeeInput): Promise<Employee> => {
      const response = await api.post("/employee/create", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>> }): Promise<Employee> => {
      const response = await api.put(`/employees/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

