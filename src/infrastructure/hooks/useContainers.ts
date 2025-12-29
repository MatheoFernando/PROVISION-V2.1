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
        const payload = data as { items?: Container[]; data?: Container[] } | Container[];
        const list = Array.isArray(payload) ? payload : (payload.items ?? payload.data ?? []);
        return list as Container[];
      } catch (err) {
        toast.error("Falha ao carregar containers");
        throw err as unknown;
      }
    },

  });
}

export function useContainer(id?: string) {
  return useQuery({
    queryKey: ["container", id ?? "unknown"],
    queryFn: async (): Promise<Container | null> => {
      if (!id) return null;
      try {
        const response = await api.get(`/container/getById/${id}`);
        return response.data?.data || response.data;
      } catch {
        return null;
      }
    },
    enabled: !!id,

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
      return response.data?.data || response.data;
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
      toast.error("Erro ao eliminar container");
    }
  });
}
