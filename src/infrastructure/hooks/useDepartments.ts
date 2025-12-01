import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { toast } from "sonner";
import { Department } from "../types/domain";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async (): Promise<Department[]> => {
      const { data } = await api.get("/department/GetAll");
      return (data?.data ?? data) as Department[];
    },

  });
}

export function useDepartmentsByName(name: string) {
  return useQuery({
    queryKey: ["departments", "name", name],
    queryFn: async (): Promise<Department[]> => {
      const { data } = await api.get("/department/getByName", { params: { name } });
      return (data?.data ?? data) as Department[];
    },
    enabled: Boolean(name && name.trim().length > 0),
  });
}

export function useDepartmentById(id?: string) {
  return useQuery({
    queryKey: ["department", id],
    queryFn: async (): Promise<Department | null> => {
      if (!id) return null;
      const { data } = await api.get(`/department/getById/${id}`);
      return data || null;
    },
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> => {
      const { data } = await api.post("/department/create", payload);
      return (data?.data ?? data) as Department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Departamento criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar departamento");
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Omit<Department, 'createdAt' | 'updatedAt'>> & { id: string }): Promise<Department> => {
      const { data } = await api.put("/department", payload);
      return (data?.data ?? data) as Department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Departamento atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar departamento");
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/department/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Departamento excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao excluir departamento");
    },
  });
}


