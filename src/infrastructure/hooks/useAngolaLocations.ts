import { useQuery } from "@tanstack/react-query";
import angolaApi from "../utils/api-angola";
import {
  AngolaCountry,
  AngolaProvince,
} from "../types/domain";
import {
  angolaCountryResponseSchema,
  angolaProvinceResponseSchema,
} from "../schema/schema-angola";

function ensureBaseUrl(): void {
  if (!process.env.NEXT_PUBLIC_API_BASE_URL_ANGOLA) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL_ANGOLA não configurada.");
  }
}

async function fetchAngolaProvinces(): Promise<AngolaProvince[]> {
  ensureBaseUrl();
  const response = await angolaApi.get("/provincias");
  const parsed = angolaProvinceResponseSchema.safeParse(response.data);
  if (!parsed.success) {
    throw new Error("Não foi possível carregar as províncias de Angola.");
  }
  return parsed.data;
}

async function fetchAngolaCountry(): Promise<AngolaCountry> {
  ensureBaseUrl();
  const response = await angolaApi.get("/angola");
  const parsed = angolaCountryResponseSchema.safeParse(response.data);
  if (!parsed.success) {
    throw new Error("Não foi possível carregar as informações do país Angola.");
  }
  return parsed.data;
}

export function useAngolaCountry() {
  return useQuery({
    queryKey: ["angola", "country"],
    queryFn: fetchAngolaCountry,
    staleTime: Infinity,
  });
}

export function useAngolaProvinces() {
  return useQuery({
    queryKey: ["angola", "provinces"],
    queryFn: fetchAngolaProvinces,
    staleTime: Infinity,
  });
}

