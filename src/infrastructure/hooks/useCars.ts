import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Car } from "../../types/domain";
import { z } from "zod";
import { createCarSchema } from "../schema/schema-cars";

type CreateCarInput = z.infer<typeof createCarSchema>;

export function useCars() {
  return useQuery({
    queryKey: ["cars"],
    queryFn: async (): Promise<Car[]> => {
      const response = await api.get("/car/getAll");
      return response.data;
    },
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();
  
  return useMutation<Car, unknown, CreateCarInput>({
    mutationFn: async (data: CreateCarInput): Promise<Car> => {
      const response = await api.post("/car/create", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/car/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
  });
}

