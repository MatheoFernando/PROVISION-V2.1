"use client";

import { useQuery } from "@tanstack/react-query";
import { api, getAccessToken } from "@/infrastructure/utils/api";
import { meResponseSchema, type MeResponseEntity } from "@/infrastructure/schema/schema-auth";
import { useAuthStore } from "./useAuthStore";

export function useMe() {
  const token = typeof window !== "undefined" ? getAccessToken() : null;

  return useQuery<MeResponseEntity>({
    queryKey: ["me"],
    queryFn: async (): Promise<MeResponseEntity> => {
      try {
        const response = await api.get("/authentication/me");
        const rawData = response.data?.data ?? response.data;
        const validatedData = meResponseSchema.parse(rawData);
        
        useAuthStore.getState().setMeData(validatedData);
        
        return validatedData;
      } catch (error) {
        throw error;
      }
    },
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
}

