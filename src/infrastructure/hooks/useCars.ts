import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Car } from "../types/domain";
import { z } from "zod";
import { createCarSchema } from "../schema/schema-cars";
import { toast } from "sonner";

type CreateCarInput = z.infer<typeof createCarSchema>;

export function useCars() {
  return useQuery({
    queryKey: ["cars"],
    queryFn: async (): Promise<Car[]> => {
      try {
        const response = await api.get("/car/getAll");
        const data = response.data as unknown;
        const list = Array.isArray(data)
          ? (data as Car[])
          : ((data as any)?.items ?? (data as any)?.data ?? []);
        return list as Car[];
      } catch (err) {
        toast.error("Falha ao carregar viaturas");
        throw err as unknown;
      }
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
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
      return response.data;
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
      toast.error("Erro ao excluir viatura");
    },
  });
}

