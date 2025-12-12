import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Car } from "../types/domain";
import { z } from "zod";
import { createCarSchema, createGrossCarSchema } from "../schema/schema-cars";
import { toast } from "sonner";
import { resolveApiErrorPayload, resolveApiResponse } from "../utils/api-response";

type CreateCarInput = z.infer<typeof createCarSchema>;
type CreateGrossCarInput = z.infer<typeof createGrossCarSchema>;

interface CarsQueryOptions {
  enabled?: boolean;
}

export function useCars(options?: CarsQueryOptions & { companyId?: string }) {
  return useQuery({
    queryKey: ["cars", options?.companyId],
    queryFn: async (): Promise<Car[]> => {
      try {
        if (options?.companyId) {
          const response = await api.get(`/car/getByCompanyId/${options.companyId}`);
          const data = response.data as unknown;
          const payload = data as { items?: unknown; data?: unknown };

          if (Array.isArray(payload)) return payload as Car[];
          if (payload && typeof payload === 'object') {
            if (Array.isArray(payload.items)) return payload.items as Car[];
            if (Array.isArray(payload.data)) return payload.data as Car[];
          }
          return [];
        }

        const response = await api.get("/car/getAll");
        const data = response.data as unknown;
        const payload = data as { items?: Car[]; data?: Car[] } | Car[];
        const list = Array.isArray(payload) ? payload : (payload.items ?? payload.data ?? []);
        return list as Car[];
      } catch (err) {
        toast.error("Falha ao carregar viaturas");
        throw err as unknown;
      }
    },
    refetchOnMount: "always",
    refetchOnReconnect: true,
    retry: 1,
    enabled: options?.enabled ?? true,
  });
}

export function useCarById(id?: string) {
  return useQuery({
    queryKey: ["car", id],
    enabled: !!id,
    queryFn: async (): Promise<Car | null> => {
      if (!id) return null;
      try {
        const response = await api.get(`/car/getById/${id}`);
        const data = response.data;
        return (data?.data ?? data) as Car | null;
      } catch {
        try {
          const response = await api.get("/car/getAll");
          const data = response.data as unknown;
          let list: Car[] = [];
          if (Array.isArray(data)) {
            list = data as Car[];
          } else {
            const payload = data as { items?: Car[]; data?: Car[] };
            list = payload.items ?? payload.data ?? [];
          }
          return list.find((c) => c.id === id) || null;
        } catch {
          return null;
        }
      }
    },
    retry: 1,
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();

  return useMutation<Car, unknown, CreateCarInput>({
    mutationFn: async (data: CreateCarInput): Promise<Car> => {
      const payload = {
        ...data,
        geoLocationId:
          data?.geoLocationId && typeof data.geoLocationId === "string" && data.geoLocationId.trim() !== ""
            ? data.geoLocationId
            : null,
      } as CreateCarInput;
      const response = await api.post("/car/create", payload);
      return response.data?.data || response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cars"] });
      await queryClient.refetchQueries({ queryKey: ["cars"], type: "active" });
      toast.success("Viatura criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar viatura");
    },
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Car, 'id' | 'createdAt' | 'updatedAt'>> }): Promise<Car> => {
      const response = await api.put(`/car`, { id, ...data });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cars"] });
      await queryClient.refetchQueries({ queryKey: ["cars"], type: "active" });
      toast.success("Viatura atualizada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar viatura");
    },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/car/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cars"] });
      await queryClient.refetchQueries({ queryKey: ["cars"], type: "active" });
      toast.success("Viatura excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao eliminar viatura");
    },
  });
}

export function useCreateGrossCar() {
  const queryClient = useQueryClient();

  return useMutation<Car, unknown, CreateGrossCarInput>({
    mutationFn: async data => {
      const response = await api.post("/car/AddGrossCar", data);
      const result = resolveApiResponse<Car>(response);
      const isSuccess = result.statusCode === 200 || result.statusCode === 201;

      if (isSuccess && result.payload) {
        return result.payload;
      }

      const fallbackData =
        typeof result.payload === "string" ? result.payload : undefined;
      const errorMessage = result.message || fallbackData || "Erro ao importar viatura";

      const error = new Error(errorMessage);
      (error as { response?: unknown }).response = {
        status: result.statusCode,
        data: result.envelope ?? result.payload,
      };
      throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cars"] });
      await queryClient.refetchQueries({ queryKey: ["cars"], type: "active" });
      toast.success("Viatura importada com sucesso!");
    },
    onError: error => {
      const resolved = resolveApiErrorPayload<Car>(error);
      const message =
        resolved.message ||
        (typeof resolved.payload === "string" ? resolved.payload : undefined) ||
        "Erro ao importar viatura";
      toast.error(message);
    },
  });
}

