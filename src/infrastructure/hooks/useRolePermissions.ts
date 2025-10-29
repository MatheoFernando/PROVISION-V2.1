import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { toast } from "sonner";
import { RolePermission } from "../../types/domain";

export function useRolePermissions() {
  return useQuery({
    queryKey: ["role-permissions"],
    queryFn: async (): Promise<RolePermission[]> => {
      const { data } = await api.get("/rolesPermissions/getAll");
      return (data?.data ?? data) as RolePermission[];
    },
  });
}

export function useCreateRolePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<RolePermission, 'id' | 'createdAt' | 'updatedAt'>): Promise<RolePermission> => {
      const { data } = await api.post("/rolesPermissions/create", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
      toast.success("Vínculo papel-permissão criado!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar vínculo");
    },
  });
}

export function useUpdateRolePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Omit<RolePermission, 'createdAt' | 'updatedAt'>> & { id: string }): Promise<RolePermission> => {
      const { data } = await api.put("/rolesPermissions", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
      toast.success("Vínculo atualizado!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar vínculo");
    },
  });
}

export function useDeleteRolePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/rolesPermissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
      toast.success("Vínculo removido!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao remover vínculo");
    },
  });
}


