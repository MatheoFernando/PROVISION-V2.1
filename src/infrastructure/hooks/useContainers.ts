import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Container } from "../types/domain";
import { z } from "zod";
import { createContainerSchema } from "../schema/schema-containers";
import { toast } from "sonner";

type CreateContainerInput = z.infer<typeof createContainerSchema>;

export function useContainers() {
  return useQuery({
    queryKey: ["containers"],
    queryFn: async (): Promise<Container[]> => {
      try {
        const response = await api.get("/container/getAll");
        const data = response.data as unknown;
        const list = Array.isArray(data)
          ? (data as Container[])
          : ((data as any)?.items ?? (data as any)?.data ?? []);
        return list as Container[];
      } catch (err) {
        toast.error("Falha ao carregar containers");
        throw err as unknown;
      }
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useContainer(id?: string) {
  return useQuery({
    queryKey: ["container", id ?? "unknown"],
    queryFn: async (): Promise<Container> => {
      if (!id) throw new Error("missing id");
      try {
        const response = await api.get(`/container/${id}`);
        return response.data;
      } catch (err) {
        toast.error("Falha ao carregar container");
        throw err as unknown;
      }
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useCreateContainer() {
  const queryClient = useQueryClient();
  
  return useMutation<Container, unknown, CreateContainerInput>({
    mutationFn: async (data: CreateContainerInput): Promise<Container> => {
      const payload = {
        cod: data.cod,
        name: data.name,
        capacity: String(data.capacity),
        companyId: data.companyId,
      };
      const response = await api.post("/container/create", payload);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["containers"] });
      await queryClient.refetchQueries({ queryKey: ["containers"], type: "active" });
      toast.success("Container criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar container");
    }
  });
}

export function useUpdateContainer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Container, 'id' | 'createdAt' | 'updatedAt'>> }): Promise<Container> => {
      const response = await api.put(`/container`, { id, ...data });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["containers"] });
      await queryClient.refetchQueries({ queryKey: ["containers"], type: "active" });
      toast.success("Container atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar container");
    }
  });
}

export function useDeleteContainer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/container/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["containers"] });
      await queryClient.refetchQueries({ queryKey: ["containers"], type: "active" });
      toast.success("Container excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir container");
    }
  });
}
