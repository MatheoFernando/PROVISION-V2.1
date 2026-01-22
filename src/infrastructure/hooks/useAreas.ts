import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Area } from "../types/domain";

interface AreasQueryOptions {
  enabled?: boolean;
  companyId?: string;
}

export function useAreas(options?: AreasQueryOptions) {
  const { enabled = true, companyId } = options ?? {};

  return useQuery({
    queryKey: ["areas", companyId],
    queryFn: async () => { 
      const targetCompanyId = companyId;

      if (targetCompanyId) {
        const { data } = await api.get(
          `/area/getAllbyCompany/${targetCompanyId}`,
        );
        return (data?.data ?? data) as Area[];
      }

 
    },
    enabled,
  });
}

export function useAreaById(id?: string) {
  return useQuery({
    queryKey: ["area", id],
    queryFn: async (): Promise<Area | null> => {
      if (!id) return null;
      const { data } = await api.get(`/area/getById/${id}`);
      return data || null;
    },
    enabled: !!id,
  });
}

export function useCreateArea() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Areas");
  return useMutation({
    mutationFn: async (payload: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>): Promise<Area> => {
      const { data } = await api.post("/area/create", payload);
      return data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData(["areas"], (old: Area[] = []) => {
        const filtered = old.filter(a => a.id !== created.id);
        return [created, ...filtered];
      });
      toast.success(t("create.success"));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t("create.error"));
    },
  });
}

export function useUpdateArea() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Areas");
  return useMutation({
    mutationFn: async (payload: Partial<Omit<Area, 'createdAt' | 'updatedAt'>> & { id: string }): Promise<Area> => {
      const { data } = await api.put("/area", payload);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["areas"], (old: Area[] = []) => {
        return old.map(a => a.id === updated.id ? updated : a);
      });
      toast.success(t("update.success"));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t("update.error"));
    },
  });
}

export function useDeleteArea() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Areas");
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/area/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success(t("delete.success"));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t("delete.error"));
    },
  });
}