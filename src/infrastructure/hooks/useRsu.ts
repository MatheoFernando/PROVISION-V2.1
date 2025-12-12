"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/infrastructure/utils/api";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { Rsu } from "@/infrastructure/types/domain";

const LIST_KEY = ["rsu"] as const;
const BY_DATE_KEY = ["rsu", "byDate"] as const;
const BY_SITE_KEY = ["rsu", "bySite"] as const;
const BY_STATUS_KEY = ["rsu", "byStatus"] as const;
const DETAIL_KEY = (id: string) => ["rsu", id] as const;
type QueryClientInstance = ReturnType<typeof useQueryClient>;

const syncRsuLists = (queryClient: QueryClientInstance) => {
  queryClient.invalidateQueries({ queryKey: LIST_KEY });
  queryClient.invalidateQueries({ queryKey: BY_DATE_KEY, exact: false });
  queryClient.invalidateQueries({ queryKey: BY_SITE_KEY, exact: false });
  queryClient.invalidateQueries({ queryKey: BY_STATUS_KEY, exact: false });
};

const setDetailCache = (queryClient: QueryClientInstance, entity: Rsu) => {
  if (!entity.id) return;
  queryClient.setQueryData(DETAIL_KEY(entity.id), entity);
};

const normalizeResponse = <T,>(payload: any): T => {
  if (!payload) return [] as T;
  return ((payload?.data ?? payload?.items ?? payload) as T) ?? ([] as T);
};

export function useRsuQuery() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: async (): Promise<Rsu[]> => {
      const { data } = await api.get("/rsu/getAll");
      return normalizeResponse<Rsu[]>(data);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRsuByDateQuery(date?: Date) {
  const dateParam = React.useMemo(() => {
    if (!date) return undefined;
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return day.toISOString();
  }, [date]);

  return useQuery({
    queryKey: ["rsu", "byDate", dateParam],
    enabled: Boolean(dateParam),
    queryFn: async (): Promise<Rsu[]> => {
      const { data } = await api.get("/rsu/getByDate", {
        params: { date: dateParam },
      });
      return normalizeResponse<Rsu[]>(data);
    },
    staleTime: 60 * 1000,
  });
}

export function useRsuBySiteQuery(siteId?: string) {
  return useQuery({
    queryKey: ["rsu", "bySite", siteId ?? "all"],
    enabled: Boolean(siteId),
    queryFn: async (): Promise<Rsu[]> => {
      const { data } = await api.get("/rsu/getBySiteId", {
        params: { siteId },
      });
      return normalizeResponse<Rsu[]>(data);
    },
    staleTime: 60 * 1000,
  });
}

export function useRsuByStatusQuery(status?: string) {
  return useQuery({
    queryKey: ["rsu", "byStatus", status ?? "all"],
    enabled: Boolean(status),
    queryFn: async (): Promise<Rsu[]> => {
      const { data } = await api.get("/rsu/getByStatus", {
        params: { status },
      });
      return normalizeResponse<Rsu[]>(data);
    },
    staleTime: 60 * 1000,
  });
}

export function useRsuDetailQuery(id?: string) {
  return useQuery({
    queryKey: id ? DETAIL_KEY(id) : ["rsu", "detail", "unknown"],
    enabled: Boolean(id),
    queryFn: async (): Promise<Rsu> => {
      const { data } = await api.get(`/rsu/${id}`);
      return (data?.data ?? data) as Rsu;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateRsuMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Rsu");

  return useMutation({
    mutationFn: async (
      payload: Omit<Rsu, "id" | "createdAt" | "updatedAt">
    ): Promise<Rsu> => {
      const { data } = await api.post("/rsu/create", payload);
      return (data?.data ?? data) as Rsu;
    },
    onSuccess: (created) => {
      syncRsuLists(queryClient);
      setDetailCache(queryClient, created);
      toast.success(t("create.success"));
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Erro ao criar RSU";
      toast.error(message);
    },
  });
}

export function useUpdateRsuMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Rsu");

  return useMutation({
    mutationFn: async (payload: Rsu): Promise<Rsu> => {
      const { data } = await api.put("/rsu", payload);
      return (data?.data ?? data) as Rsu;
    },
    onSuccess: (updated) => {
      syncRsuLists(queryClient);
      setDetailCache(queryClient, updated);
      toast.success(t("update.success"));
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Erro ao atualizar RSU";
      toast.error(message);
    },
  });
}

export function useDeleteRsuMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Rsu");

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/rsu/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: DETAIL_KEY(id) });
      syncRsuLists(queryClient);
      toast.success(t("delete.success"));
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Erro ao eliminar RSU";
      toast.error(message);
    },
  });
}