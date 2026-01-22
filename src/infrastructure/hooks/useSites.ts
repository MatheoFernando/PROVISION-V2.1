import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import type { Site } from "../types/domain";
import type { CreateGrossSitePayload, CreateSite } from "../schema/schema-sites";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { resolveApiErrorPayload, resolveApiResponse } from "../utils/api-response";

interface SitesQueryOptions {
  enabled?: boolean;
}

export function useSites(customerId?: string, options?: SitesQueryOptions & { companyId?: string }) {
  return useQuery({
    queryKey: ["sites", customerId, options?.companyId],
    queryFn: async (): Promise<Site[]> => {
      if (!options?.companyId) return [];
      const response = await api.get(`/site/getByCompanyId/${options.companyId}`);
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    },
    refetchOnReconnect: true,
    retry: 1,
    enabled: (options?.enabled ?? true) && !!options?.companyId,
  });
}



export function useSiteById(id?: string, options?: SitesQueryOptions) {
  return useQuery({
    queryKey: ["site", id],
    queryFn: async (): Promise<Site | null> => {
      if (!id) return null;
      const response = await api.get(`/site/getById`, { params: { id } });
      const data = response.data?.data ?? response.data ?? null;
      return (data as Site) ?? null;
    },

    enabled: (options?.enabled ?? true) && Boolean(id),
  });
}




export function useCreateGrossSite() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Sites");

  return useMutation<Site, unknown, CreateGrossSitePayload>({
    mutationFn: async payload => {
      const requestPayload: any = { ...payload };
      if (!requestPayload.contact || (!requestPayload.contact.email && (!requestPayload.contact.phoneNumbers || requestPayload.contact.phoneNumbers.length === 0))) {
        delete requestPayload.contact;
      }
      if (!requestPayload.address || !requestPayload.address.houseHold) {
        delete requestPayload.address;
      }
      const response = await api.post("/site/AddGrossSite", requestPayload);
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
      toast.success(t("import.success"));
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
  const t = useTranslations("Hooks.Sites");

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Site, 'id' | 'createdAt' | 'updatedAt'>> }): Promise<Site> => {
      const response = await api.put(`/site`, { id, ...data });
      return response.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      queryClient.invalidateQueries({ queryKey: ["site"] });
      queryClient.refetchQueries({ queryKey: ["sites"], type: 'active' });
      toast.success(t("update.success"));
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Sites");

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/site/${id}`);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      queryClient.refetchQueries({ queryKey: ["sites"], type: 'active' });
      toast.success(t("delete.success"));
    },
  });
}

