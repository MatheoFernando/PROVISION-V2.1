import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Employee } from "../types/domain";
import { z } from "zod";
import {
  createEmployeeSchema,
  type CreateGrossEmployeePayload,
} from "../schema/schema-employees";
import { toast } from "sonner";
import { resolveApiErrorPayload, resolveApiResponse } from "../utils/api-response";

type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

const employeesKey = (companyId?: string) => ["employees", companyId] as const;

interface EmployeesQueryOptions {
  enabled?: boolean;
}

export function useEmployees(companyId?: string, options?: EmployeesQueryOptions) {
  return useQuery({
    queryKey: employeesKey(companyId),
    enabled: (options?.enabled ?? true) && Boolean(companyId),
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
    onSuccess: (created, variables) => {
      const key = employeesKey(variables.companyId);
      queryClient.setQueryData<Employee[]>(key, (current = []) => {
        const alreadyExists = current.some((employee) => employee.id === created.id);
        if (alreadyExists) {
          return current.map((employee) =>
            employee.id === created.id ? created : employee
          );
        }
        return [created, ...current];
      });
      queryClient.invalidateQueries({ queryKey: key });
      toast.success('Funcionário criado com sucesso!');
    },
  });
}

export function useCreateGrossEmployee() {
  const queryClient = useQueryClient();

  return useMutation<Employee, unknown, CreateGrossEmployeePayload>({
    mutationFn: async data => {
      const response = await api.post("/employee/AddGrossEmployee", data);
      const result = resolveApiResponse<Employee>(response);
      const isSuccess = result.statusCode === 200 || result.statusCode === 201;

      if (isSuccess && result.payload) {
        return result.payload;
      }

      const fallbackData =
        typeof result.payload === "string" ? result.payload : undefined;
      const errorMessage = result.message || fallbackData || "Erro ao importar funcionário";

      const error = new Error(errorMessage);
      (error as { response?: unknown }).response = {
        status: result.statusCode,
        data: result.envelope ?? result.payload,
      };
      throw error;
    },
    onSuccess: (_, variables) => {
      const key = employeesKey(variables.companyId);
      queryClient.invalidateQueries({ queryKey: key });
      toast.success("Funcionário importado com sucesso!");
    },
    onError: error => {
      const resolved = resolveApiErrorPayload<Employee>(error);
      const message =
        resolved.message ||
        (typeof resolved.payload === "string" ? resolved.payload : undefined) ||
        "Erro ao importar funcionário";
      toast.error(message);
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
    onSuccess: (updated) => {
      const key = employeesKey(updated.companyId);
      queryClient.setQueryData<Employee[]>(key, (current = []) =>
        current.map((employee) => (employee.id === updated.id ? { ...employee, ...updated } : employee))
      );
      queryClient.invalidateQueries({ queryKey: key });
      toast.success('Funcionário atualizado com sucesso!');
    },
  });
}

export function useDeleteEmployee(defaultCompanyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; companyId?: string }): Promise<void> => {
      await api.delete(`/employee/${id}`);
    },
    onSuccess: (_, variables) => {
      const key = employeesKey(variables.companyId ?? defaultCompanyId);
      queryClient.setQueryData<Employee[]>(key, (current = []) =>
        current.filter((employee) => employee.id !== variables.id)
      );
      queryClient.invalidateQueries({ queryKey: key });
      toast.success('Funcionário excluído com sucesso!');
    },
  });
}

