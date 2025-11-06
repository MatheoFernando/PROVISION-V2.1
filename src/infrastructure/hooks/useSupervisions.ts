"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/infrastructure/utils/api";
import { toast } from "sonner";
import { Supervision } from "../types/domain";

const QUERY_KEY = ["supervisions"] as const;

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

  return useMutation({
    mutationFn: async (data: Supervision): Promise<Supervision> => {
    
      const response = await api.post("/supervision/create", data );
      return (response.data?.data ?? response.data) as Supervision;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisions"] });
      toast.success("Supervisão criada com sucesso");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao criar supervisão");
    },
  });
}

export function useUpdateSupervisionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Supervision;
    }): Promise<Supervision> => {
      const response = await api.put(`/supervision/${id}`, data);
      return response.data;
    },
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<Supervision[] | undefined>(QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((e) => (e.id === variables.id ? (updated as Supervision) : e));
      });
      toast.success("Supervisão atualizada com sucesso");
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

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/supervision/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisions"] });
      toast.success("Supervisão excluída com sucesso");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erro ao excluir supervisão"
      );
    },
  });
}
