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

export function useCustomers() {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEY,
    queryFn: async (): Promise<Customer[]> => {
      const response = await api.get("/customer/getAll");
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
}

export function useCustomersByCompanyId(companyId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, "byCompany", companyId],
    queryFn: async (): Promise<Customer[]> => {
      const response = await api.get("/customer/getByCompanyId", {
        params: { companyId },
      });
      return response.data.data;
    },
    enabled: (options?.enabled ?? true) && !!companyId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Customers");

  return useMutation({
    mutationFn: async (data: CreateCustomerPayload): Promise<Customer> => {
      const response = await api.post("/customer/create", data);
      const createdCustomer = response.data?.data || response.data;
      return createdCustomer as Customer;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      await queryClient.refetchQueries({
        queryKey: CUSTOMERS_QUERY_KEY,
        type: "active",
      });
      toast.success(t("create.success"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Erro desconhecido ao criar cliente";
      toast.error(message);
    },
  });
}

export function useCreateGrossCustomer() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Customers");

  return useMutation({
    mutationFn: async (
      data: CreateGrossCustomerPayload
    ): Promise<Customer> => {
      const response = await api.post("/customer/AddGrossCustomer", data);
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
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
}

export function useCustomerById(id?: string) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, id],
    queryFn: async (): Promise<Customer | null> => {
      if (!id) return null;
      try {
        const response = await api.get(`/customer/${id}`);
        return response.data.data ?? response.data ?? null;
      } catch {
        const response = await api.get("/customer/getAll");
        const customers = response.data.data ?? [];
        return (customers as Customer[]).find((c) => c.id === id) ?? null;
      }
    },
    enabled: Boolean(id),
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
}