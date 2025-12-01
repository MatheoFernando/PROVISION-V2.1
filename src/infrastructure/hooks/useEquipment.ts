import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Equipment, Site } from "../types/domain";
import { z } from "zod";
import {
  createEquipmentSchema,
  type CreateGrossEquipmentPayload,
} from "../schema/schema-equipment";
import { toast } from "sonner";
import {
  resolveApiErrorPayload,
  resolveApiResponse,
} from "../utils/api-response";

type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export interface UpdateEquipmentInput
  extends Partial<Omit<Equipment, "createdAt" | "updatedAt">> {
  id: string;
  status?: "ACTIVE" | "INACTIVE";
}

const QUERY_KEY = ["equipment"] as const;

interface EquipmentQueryOptions {
  enabled?: boolean;
}

export function useEquipment(customerId?: string, options?: EquipmentQueryOptions) {
  return useQuery({
    queryKey: [...QUERY_KEY, customerId],
    queryFn: async (): Promise<Equipment[]> => {
      const response = await api.get("/equipment/getAll");
      const allEquipment = response.data.data as Equipment[];

      // Se customerId fornecido, precisamos buscar sites primeiro e filtrar
      if (customerId && Array.isArray(allEquipment)) {
        // Buscar sites do cliente para obter os IDs
        const sitesResponse = await api.get("/site/getAll", { params: { customerId } });
        const customerSites = sitesResponse.data.data || [];
        const siteIds = new Set(customerSites.map((site: Site) => site.id).filter(Boolean));

        // Filtrar equipamentos cujos sites pertencem ao cliente
        return allEquipment.filter((eq: Equipment) => siteIds.has(eq.siteId));
      }

      return allEquipment;
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}

export function useEquipmentById(id?: string, companyId?: string) {
  return useQuery({
    queryKey: ["equipment", id, companyId],
    queryFn: async (): Promise<Equipment | null> => {
      if (!id) return null;
      const { data } = await api.get(`/equipment/getById/${id}`);
      return data || null;
    },
    enabled: !!id,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation<Equipment, unknown, CreateEquipmentInput>({
    mutationFn: async (data: CreateEquipmentInput): Promise<Equipment> => {
      const payload = {
        cod: data.cod,
        serialNumber: data.serialNumber,
        status: data.status ? "ACTIVE" : "INACTIVE",
        mark: data.mark,
        model: data.model,
        siteId: data.siteId,
        typeEquipmentId: data.typeEquipmentId,
        companyId: data.companyId,
      };
      const response = await api.post("/equipment/create", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data as Equipment;
    },
    onSuccess: async (created) => {
      queryClient.setQueryData<Equipment[] | undefined>(QUERY_KEY, (old) => {
        const current = old ?? [];
        return [created, ...current];
      });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY, refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: QUERY_KEY, type: "active" });
      toast.success("Equipamento criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar equipamento");
    },
  });
}

export function useCreateGrossEquipment() {
  const queryClient = useQueryClient();

  return useMutation<Equipment, unknown, CreateGrossEquipmentPayload>({
    mutationFn: async (data) => {
      const response = await api.post("/equipment/AddGrossEquipment", data);
      const result = resolveApiResponse<Equipment>(response);
      const isSuccess = result.statusCode === 200 || result.statusCode === 201;

      if (isSuccess && result.payload) {
        return result.payload;
      }

      const fallbackData =
        typeof result.payload === "string" ? result.payload : undefined;
      const errorMessage = result.message || fallbackData || "Erro ao importar equipamento";

      const error = new Error(errorMessage);
      (error as { response?: unknown }).response = {
        status: result.statusCode,
        data: result.envelope ?? result.payload,
      };
      throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY, refetchType: "active" });
      toast.success("Equipamento importado com sucesso!");
    },
    onError: (error) => {
      const resolved = resolveApiErrorPayload<Equipment>(error);
      const message =
        resolved.message ||
        (typeof resolved.payload === "string" ? resolved.payload : undefined) ||
        "Erro ao importar equipamento";
      toast.error(message);
    },
  });
}

type EquipmentListContext = { previous?: Equipment[] };

export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation<
    Equipment,
    unknown,
    UpdateEquipmentInput,
    EquipmentListContext
  >({
    mutationFn: async (data) => {
      const response = await api.put(`/equipment`, data);
      return response.data as Equipment;
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<Equipment[]>(QUERY_KEY);
      if (previous) {
        queryClient.setQueryData<Equipment[] | undefined>(QUERY_KEY, (old) =>
          old?.map((item) =>
            item.id === data.id ? { ...item, ...data } : item,
          ) ?? old,
        );
      }
      return { previous };
    },
    onSuccess: async (updated) => {
      queryClient.setQueryData<Equipment[] | undefined>(QUERY_KEY, (old) => {
        if (!old) return [updated];
        return old.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        );
      });
      toast.success("Equipamento atualizado com sucesso!");
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
      toast.error("Erro ao atualizar equipamento");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
        refetchType: "active",
      });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/equipment/${id}`);
    },
    onSuccess: async (_void, id) => {
      queryClient.setQueryData<Equipment[] | undefined>(QUERY_KEY, (old) => {
        if (!old) return old;
        return old.filter((e) => e.id !== id);
      });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY, refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: QUERY_KEY, type: "active" });
      toast.success("Equipamento excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir equipamento");
    },
  });
}

