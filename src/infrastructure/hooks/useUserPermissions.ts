import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/infrastructure/utils/api"
import { toast } from "sonner"

interface UserPermissionsParams {
  userId?: string
  companyId?: string
  enabled?: boolean
}

interface UpdateUserPermissionsPayload {
  userId: string
  permissions: string[]
  companyId?: string
}

function normalizePermissionsPayload(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((permission): permission is string => typeof permission === "string")
  }

  if (typeof raw === "object" && raw !== null) {
    const maybePermissions = (raw as { permissions?: unknown }).permissions
    if (Array.isArray(maybePermissions)) {
      return maybePermissions.filter((permission): permission is string => typeof permission === "string")
    }
  }

  return []
}

export function useUserPermissionsQuery({ userId, companyId, enabled = true }: UserPermissionsParams) {
  return useQuery<string[]>({
    queryKey: ["user-permissions", userId, companyId],
    enabled: Boolean(enabled && userId && companyId),
    queryFn: async (): Promise<string[]> => {
      if (!userId) return []
      const { data } = await api.get(`/users/${userId}/permissions`, {
        params: { companyId },
      })
      const payload = data?.data ?? data
      return normalizePermissionsPayload(payload)
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useUpdateUserPermissionsMutation() {
  const queryClient = useQueryClient()

  return useMutation<unknown, unknown, UpdateUserPermissionsPayload>({
    mutationKey: ["user-permissions-update"],
    mutationFn: async ({ userId, permissions, companyId }) => {
      const payload = { permissions, companyId }
      const { data } = await api.put(`/users/${userId}/permissions`, payload)
      return data
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions", variables.userId, variables.companyId] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Permissões atualizadas com sucesso")
    },
    onError: () => {
      toast.error("Não foi possível atualizar as permissões")
    },
  })
}




