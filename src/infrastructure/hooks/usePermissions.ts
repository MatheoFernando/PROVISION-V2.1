import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { toast } from "sonner";
import { Permission } from "../types/domain";

export function usePermissions(companyId?: string) {
  return useQuery({
    queryKey: ["permissions", companyId],
    queryFn: async (): Promise<Permission[]> => {
      const { data } = await api.get("/Permissions/getAllByCompanyId", { params: { companyId } });
      return (data?.data ?? data) as Permission[];
    },
  });
}

export function usePermissionsByName(name: string) {
  return useQuery({
    queryKey: ["permissions", "name", name],
    queryFn: async (): Promise<Permission[]> => {
      const { data } = await api.get("/Permissions/getAllByName", { params: { name } });
      return (data?.data ?? data) as Permission[];
    },
    enabled: Boolean(name && name.trim().length > 0),
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> => {
      const { data } = await api.post("/Permissions/create", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permissão criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar permissão");
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Omit<Permission, 'createdAt' | 'updatedAt'>> & { id: string }): Promise<Permission> => {
      const { data } = await api.put("/Permissions", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permissão atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar permissão");
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/Permissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permissão excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao eliminar permissão");
    },
  });
}


