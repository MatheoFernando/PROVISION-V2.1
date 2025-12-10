"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/infrastructure/utils/api";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Supervision } from "../types/domain";

const QUERY_KEY = ["supervisions"] as const;
const BY_DATE_QUERY_KEY = ["supervisions", "byDate"] as const;
const DETAIL_KEY = (id: string) => ["supervisions", id] as const;
type QueryClientInstance = ReturnType<typeof useQueryClient>;

const syncLists = (queryClient: QueryClientInstance) => {
  queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: BY_DATE_QUERY_KEY, exact: false });
};

const setDetailCache = (
  queryClient: QueryClientInstance,
  entity: Supervision
) => {
  if (!entity.id) return;
  queryClient.setQueryData(DETAIL_KEY(entity.id), entity);
};

export function useSupervisionsQuery() {
  return useQuery({
    queryKey: ["supervisions"],
    queryFn: async (): Promise<Supervision[]> => {
      const response = await api.get("/supervision/getAll");
      return (response.data?.data ?? response.data) as Supervision[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSupervisionsByDayQuery(date?: Date) {
  const dataParam = React.useMemo(() => {
    if (!date) return undefined;
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return day.toISOString();
  }, [date]);

  return useQuery({
    queryKey: ["supervisions", "byDate", dataParam],
    enabled: !!dataParam,
    queryFn: async (): Promise<Supervision[]> => {
      const response = await api.get("/supervision/getByDate", { params: { data: dataParam } });
      return (response.data?.data ?? response.data) as Supervision[];
    },
    staleTime: 60 * 1000,
  });
}


export function useSupervisionQuery(id: string) {
  return useQuery({
    queryKey: ["supervisions", id],
    queryFn: async (): Promise<Supervision> => {
      const response = await api.get(`/supervision/${id}`);
      return (response.data?.data ?? response.data) as Supervision;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSupervisionMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Supervisions");

  return useMutation({
    mutationFn: async (data: Supervision): Promise<Supervision> => {

      const response = await api.post("/supervision/create", data);
      return (response.data?.data ?? response.data) as Supervision;
    },
    onSuccess: (created) => {
      setDetailCache(queryClient, created);
      syncLists(queryClient);
      toast.success(t("create.success"));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("create.error"));
    },
  });
}

export function useUpdateSupervisionMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Supervisions");

  return useMutation({
    mutationFn: async (data: Supervision): Promise<Supervision> => {
      const response = await api.put("/supervision", data);
      const payload = (response.data?.data ?? response.data) as Supervision;
      return payload;
    },
    onSuccess: (updated) => {
      setDetailCache(queryClient, updated);
      syncLists(queryClient);
      toast.success(t("update.success"));
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erro ao atualizar supervisão"
      );
    },
  });
}

export function useDeleteSupervisionMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Supervisions");

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/supervision/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: DETAIL_KEY(id) });
      syncLists(queryClient);
      toast.success(t("delete.success"));
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erro ao excluir supervisão"
      );
    },
  });
}
