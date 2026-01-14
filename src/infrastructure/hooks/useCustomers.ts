import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import type { Customer } from "../types/domain";
import {
  type CreateCustomerPayload,
  type CreateGrossCustomerPayload,
} from "../schema/schema-customers";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const CUSTOMERS_QUERY_KEY = ["customers"] as const;



export function useCustomersByCompanyId(companyId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, "byCompany", companyId],
    queryFn: async (): Promise<Customer[]> => {
      const response = await api.get("/customer/getByCompanyId", {
        params: { companyId },
      });
      return response.data.data ?? response.data ?? [];
    },
    enabled: (options?.enabled ?? true) && !!companyId,
 
  });
}


export function useCreateGrossCustomer() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Customers");

  return useMutation({
    mutationFn: async (
      data: CreateGrossCustomerPayload
    ): Promise<Customer> => {
      const payload: any = { ...data };
      if (!payload.contact || (!payload.contact.email && (!payload.contact.phoneNumbers || payload.contact.phoneNumbers.length === 0))) {
        delete payload.contact;
      }
      if (!payload.address || !payload.address.houseHold) {
        delete payload.address;
      }
      const response = await api.post("/customer/AddGrossCustomer", payload);
      const createdCustomer = response.data?.data || response.data;
      return createdCustomer as Customer;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      await queryClient.refetchQueries({
        queryKey: CUSTOMERS_QUERY_KEY,
        type: "active",
      });
      toast.success(t("import.success"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Erro desconhecido ao criar cliente em massa";
      toast.error(message);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Customers");

  return useMutation({
    mutationFn: async (
      payload: Partial<Omit<Customer, "createdAt" | "updatedAt">> & {
        id: string;
      }
    ): Promise<Customer> => {
      const response = await api.put(`/customer`, payload);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      await queryClient.refetchQueries({
        queryKey: CUSTOMERS_QUERY_KEY,
        type: "active",
      });
      toast.success(t("update.success"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Erro desconhecido ao atualizar cliente";
      toast.error(message);
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Customers");

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/customer/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      await queryClient.refetchQueries({
        queryKey: CUSTOMERS_QUERY_KEY,
        type: "active",
      });
      toast.success(t("delete.success"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Erro desconhecido ao deletar cliente";
      toast.error(message);
    },
  });
}

export function useSearchCustomersByName(name: string) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, "name", name],
    queryFn: async (): Promise<Customer[]> => {
      const response = await api.get(`/customer/name`, { params: { name } });
      return response.data.data ?? response.data;
    },
    enabled: Boolean(name && name.trim().length > 0),
    refetchOnReconnect: true,
    retry: 1,
  });
}

export function useCustomerById(id?: string) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, id],
    queryFn: async (): Promise<Customer | null> => {
      if (!id) return null;
      const response = await api.get("/customer/getById", { params: { id } });
      return response.data.data ?? response.data ?? null;
    },
    enabled: Boolean(id),
    refetchOnReconnect: true,
    retry: 1,
  });
}