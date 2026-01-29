import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { toast } from "sonner";
import { RolePermission } from "../types/domain";

export function useRolePermissionsByRoleId(roleId?: string) {
  return useQuery({
    queryKey: ["role-permissions", "role", roleId],
    queryFn: async (): Promise<RolePermission[]> => {
      if (!roleId) return [];
      const { data } = await api.get(`/rolesPermissions/getAllRolePermissionsByRoleId/${roleId}`);
      return (data?.data ?? data) as RolePermission[];
    },
    enabled: !!roleId
  });
}

export function useRolePermissionsByUserId(userId?: string) {
  return useQuery({
    queryKey: ["role-permissions", "user", userId],
    queryFn: async (): Promise<RolePermission[]> => {
      if (!userId) return [];
      const { data } = await api.get(`/rolesPermissions/getAllRolePermissionsByUserId/${userId}`);
      return (data?.data ?? data) as RolePermission[];
    },
    enabled: !!userId
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
