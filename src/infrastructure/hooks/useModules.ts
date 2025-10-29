import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/infrastructure/utils/api";
import { toast } from "sonner";
import { moduleSchema, modulesListSchema, type ModuleSchema } from "@/infrastructure/schema/schema-module";
import { z } from "zod";

export function useModules() {
  return useQuery({
    queryKey: ["modules"],
    queryFn: async (): Promise<ModuleSchema[]> => {
      const { data } = await api.get("/modules/getAll");
      const parsed = modulesListSchema.safeParse(data?.data ?? data);
      if (!parsed.success) throw new Error("Falha ao validar módulos");
      return parsed.data;
    },
  });
}

export function useModulesByName(name: string) {
  return useQuery({
    queryKey: ["modules", "name", name],
    queryFn: async (): Promise<ModuleSchema[]> => {
      const { data } = await api.get("/modules/getByName", { params: { name } });
      const parsed = modulesListSchema.safeParse(data?.data ?? data);
      if (!parsed.success) throw new Error("Falha ao validar módulos por nome");
      return parsed.data;
    },
    enabled: Boolean(name && name.trim().length > 0),
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<ModuleSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<ModuleSchema> => {
      const payloadSchema = moduleSchema.omit({ id: true, createdAt: true, updatedAt: true });
      const parsedPayload = payloadSchema.parse(payload);
      const { data } = await api.post("/modules/create", parsedPayload);
      const parsed = moduleSchema.safeParse(data?.data ?? data);
      if (!parsed.success) throw new Error("Falha ao validar módulo criado");
      return parsed.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success("Módulo criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar módulo");
    },
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Omit<ModuleSchema, 'createdAt' | 'updatedAt'>> & { id: string }): Promise<ModuleSchema> => {
      const updateSchema = moduleSchema.partial().extend({ id: z.string() });
      const parsedPayload = updateSchema.parse(payload);
      const { data } = await api.put("/modules", parsedPayload);
      const parsed = moduleSchema.safeParse(data?.data ?? data);
      if (!parsed.success) throw new Error("Falha ao validar módulo atualizado");
      return parsed.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success("Módulo atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar módulo");
    },
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/modules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success("Módulo excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao excluir módulo");
    },
  });
}


