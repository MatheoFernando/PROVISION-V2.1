

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import type { User, CreateUserPayload, UpdateUserPayload } from "../types/domain";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { resolveApiErrorPayload } from "../utils/api-response";

const usersKey = (companyId?: string, isGlobalAdmin?: boolean) => ["users", companyId, isGlobalAdmin] as const;


export function useCreateUser(options?: { showToast?: boolean }) {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Users");
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: async (payload: CreateUserPayload): Promise<User> => {
      const response = await api.post("/users/create", payload);
      return response.data?.data ?? response.data;
    },
    onSuccess: (_, variables) => {
      const key = usersKey(variables.companyId);
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (showToast) toast.success(t("create.success"));
    },
    onError: (error) => {
        const resolved = resolveApiErrorPayload(error);
        const message = resolved.message || t("create.error");
        if (showToast) toast.error(message);
    }
  });
}

export function useUpdateUser(options?: { showToast?: boolean }) {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Users");
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: async (payload: UpdateUserPayload): Promise<User> => {
      const response = await api.put("/users", payload);
      return response.data;
    },
    onSuccess: (updated) => {
      const key = usersKey(updated.companyId);
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (showToast) toast.success(t("update.success"));
    },
    onError: (error) => {
        const resolved = resolveApiErrorPayload(error);
        const message = resolved.message || t("update.error");
        if (showToast) toast.error(message);
    }
  });
}

export function useDeleteUser(options?: { showToast?: boolean }) {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Users");
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (showToast) toast.success(t("delete.success"));
    },
    onError: (error) => {
        const resolved = resolveApiErrorPayload(error);
        const message = resolved.message || t("delete.error");
        if (showToast) toast.error(message);
    }
  });
}




export function useUsers(companyId?: string, isGlobalAdmin?: boolean) {
  
  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: usersKey(companyId, isGlobalAdmin),
    queryFn: async () => {
        let response;
        if (isGlobalAdmin) {
          // Superadmin: fetch all users
          response = await api.get("/users/getAll");
        } else {
          // Admin: fetch users by company ID
          response = await api.get(`/users/getAllByCompanyId/${companyId}`);
        }
        return response.data?.data ?? response.data ?? [];
    },
    enabled: true 
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  return {
    users: (users as User[]) ?? [],
    isLoading,
    isError,
    error,
    createUser: createUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    updateUser: updateUserMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
    deleteUser: deleteUserMutation.mutateAsync,
    isDeleting: deleteUserMutation.isPending,
  };
}
