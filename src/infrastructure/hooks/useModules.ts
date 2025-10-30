import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/infrastructure/utils/api";
import { toast } from "sonner";
import { moduleSchema, modulesListSchema, type ModuleSchema } from "@/infrastructure/schema/schema-module";

export function useModules() {
  return useQuery({
    queryKey: ["modules"],
    queryFn: async (): Promise<ModuleSchema[]> => {
      const { data } = await api.get("/modules/getAll");
      return data.data;
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
    mutationFn: async (payload: Omit<ModuleSchema, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await api.post("/modules/create", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success("Módulo criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar módulo");
    },
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ModuleSchema> & { id: string }) => {
      const { data } = await api.put("/modules", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success("Módulo atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar módulo");
    },
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/modules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success("Módulo excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir módulo");
    },
  });
}


