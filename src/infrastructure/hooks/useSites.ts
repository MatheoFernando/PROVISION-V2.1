import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import type { Site } from "../types/domain";
import type { CreateGrossSitePayload, CreateSite } from "../schema/schema-sites";
import { toast } from "sonner";
import { resolveApiErrorPayload, resolveApiResponse } from "../utils/api-response";

interface SitesQueryOptions {
  enabled?: boolean;
}

export function useSites(customerId?: string, options?: SitesQueryOptions) {
  return useQuery({
    queryKey: ["sites", customerId],
    queryFn: async (): Promise<Site[]> => {
      const response = customerId
        ? await api.get("/site/getByCustomerId", { params: { customerId } })
        : await api.get("/site/getAll");
      return response.data.data ?? response.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
    enabled: options?.enabled ?? true,
  });
}

export function useSitesByCompanyAndCustomer(
  companyId?: string,
  customerId?: string,
  options?: SitesQueryOptions,
) {
  return useQuery({
    queryKey: ["sites", "by-company-customer", companyId, customerId],
    queryFn: async (): Promise<Site[]> => {
      if (!companyId || !customerId) return [];
      const response = await api.get(`/site/getByCompanyAndCustomerId:${companyId},${customerId}`);
      return response.data.data ?? response.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
    enabled: (options?.enabled ?? true) && Boolean(companyId && customerId),
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();

  return useMutation<Site, unknown, CreateSite>({
    mutationFn: async (data) => {
      const response = await api.post("/site/create", data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      await queryClient.refetchQueries({ queryKey: ["sites"], type: 'active' });
      toast.success("Site criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar site");
    },
  });
}



export function useCreateGrossSite() {
  const queryClient = useQueryClient();

  return useMutation<Site, unknown, CreateGrossSitePayload>({
    mutationFn: async payload => {
      const response = await api.post("/site/AddGrossSite", payload);
      const result = resolveApiResponse<Site>(response);
      const isSuccess = result.statusCode === 200 || result.statusCode === 201;

      if (isSuccess && result.payload) {
        return result.payload;
      }

      const fallbackData =
        typeof result.payload === "string" ? result.payload : undefined;
      const errorMessage = result.message || fallbackData || "Erro ao importar site";

      const error = new Error(errorMessage);
      (error as { response?: unknown }).response = {
        status: result.statusCode,
        data: result.envelope ?? result.payload,
      };
      throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      await queryClient.refetchQueries({ queryKey: ["sites"], type: "active" });
      toast.success("Site importado com sucesso!");
    },
    onError: error => {
      const resolved = resolveApiErrorPayload<Site>(error);
      const message =
        resolved.message ||
        (typeof resolved.payload === "string" ? resolved.payload : undefined) ||
        "Erro ao importar site";
      toast.error(message);
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Site, 'id' | 'createdAt' | 'updatedAt'>> }): Promise<Site> => {
      const response = await api.put(`/site`, { id, ...data });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      await queryClient.refetchQueries({ queryKey: ["sites"], type: 'active' });
      toast.success("Site atualizado com sucesso!");
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/site/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      await queryClient.refetchQueries({ queryKey: ["sites"], type: 'active' });
      toast.success("Site excluído com sucesso!");
    },
  });
}

