import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Car, CreateCar, UpdateCar } from "../schema/schema-cars";
import { defaultCars } from "../schema/schema-cars";

export function useCars() {
  return useQuery({
    queryKey: ["cars"],
    queryFn: async (): Promise<Car[]> => {
      // Mock data para veículos
      const mockData = defaultCars;
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockData;
    },
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCar): Promise<Car> => {
      const response = await api.post("/cars", data);
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
    mutationFn: async ({ id, data }: { id: string; data: UpdateCar }): Promise<Car> => {
      const response = await api.put(`/cars/${id}`, data);
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
      await api.delete(`/cars/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
  });
}

