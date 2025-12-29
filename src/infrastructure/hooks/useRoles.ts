import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../utils/api";
import { Role } from "../types/domain";

interface UseRolesOptions {
  enabled?: boolean;
}

interface UseRolesAllOptions {
  enabled?: boolean;
}

export function useRoles(name?: string, options: UseRolesOptions = {}) {
  const normalizedName = name?.trim() ?? "";
  const isEnabled =
    (options.enabled ?? (normalizedName.length > 0)) &&
    normalizedName.length > 0;

  return useQuery({
    queryKey: ["roles", normalizedName],
    queryFn: async (): Promise<Role[]> => {
      const params = { name: normalizedName };
      const { data } = await api.get("/roles/getByName", { params });
      return (data?.data ?? data) as Role[];
    },
    enabled: isEnabled,
 
  });
}

export function useRolesAll(options: UseRolesAllOptions = {}) {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async (): Promise<Role[]> => {
      const { data } = await api.get("/roles/getAll");
      return (data?.data) as Role[];
    },
    enabled: options.enabled ?? true,
 

  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> => {
      const { data } = await api.post("/roles/create", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Papel criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar papel");
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Omit<Role, 'createdAt' | 'updatedAt'>> & { id: string }): Promise<Role> => {
      const { data } = await api.put("/roles", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Papel atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar papel");
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Papel excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao eliminar papel");
    },
  });
}

export function useRolesComposite() {
  const rolesQuery = useRolesAll();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  return {
    roles: rolesQuery.data ?? [],
    isLoading: rolesQuery.isLoading,
    isError: rolesQuery.isError,
    error: rolesQuery.error,

    isCreating: createRole.isPending,
    isUpdating: updateRole.isPending,
    isDeleting: deleteRole.isPending,

    createRole: createRole.mutateAsync,
    updateRole: updateRole.mutateAsync,
    deleteRole: deleteRole.mutateAsync,

    refetch: rolesQuery.refetch,
  };
}


