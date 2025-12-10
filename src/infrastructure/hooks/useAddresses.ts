import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Address } from "../types/domain";

interface ApiListResponse<T> {
  data?: T;
  success?: boolean;
}

interface ApiItemResponse<T> {
  data?: T;
  success?: boolean;
}

export function useAddresses(companyId?: string) {
  return useQuery({
    queryKey: ["addresses", companyId],
    queryFn: async (): Promise<Address[]> => {
      if (!companyId) return [];

      const response = await api.get<ApiListResponse<Address[]>>(
        "/address/getAll"
      );

      const payload = response.data;
      if (Array.isArray(payload)) return payload as Address[];

      return (payload?.data ?? []) as Address[];
    },
    enabled: !!companyId,
  });
}

export function useAddressesByHouseHold(houseHold: string) {
  return useQuery({
    queryKey: ["addresses", "houseHold", houseHold],
    queryFn: async (): Promise<Address[]> => {
      const { data } = await api.get<ApiListResponse<Address[]>>(
        `/address/getByHouseHold`,
        { params: { houseHold } }
      );

      if (Array.isArray(data)) return data as Address[];
      return (data?.data ?? []) as Address[];
    },
    enabled: !!houseHold,
  });
}

export function useAddressById(id?: string) {
  return useQuery({
    queryKey: ["address", id],
    queryFn: async (): Promise<Address | null> => {
      if (!id) return null;

      try {
        const { data } = await api.get<ApiItemResponse<Address> | Address>(
          `/address/getById/${id}`
        );

        if (data && (data as ApiItemResponse<Address>).data) {
          return (data as ApiItemResponse<Address>).data ?? null;
        }

        return (data as Address) ?? null;
      } catch (error) {
        const response = await api.get<ApiListResponse<Address[]>>(
          "/address/getAll"
        );
        const payload = response.data;
        let addresses: Address[] = [];
        if (Array.isArray(payload)) {
          addresses = payload;
        } else {
          addresses = (payload?.data ?? []) as Address[];
        }
        return addresses.find((a) => a.id === id) || null;
      }
    },
    enabled: !!id,
    retry: 1,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Addresses");

  return useMutation({
    mutationFn: async (
      payload: Omit<Address, "id" | "createdAt" | "updatedAt">
    ): Promise<Address> => {
      const response = await api.post<ApiItemResponse<Address> | Address>(
        "/address/create",
        payload
      );

      const data = response.data;
      if (data && (data as ApiItemResponse<Address>).data) {
        return (data as ApiItemResponse<Address>).data as Address;
      }

      return data as Address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success(t("create.success"));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("create.error"));
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Addresses");

  return useMutation({
    mutationFn: async (
      data: Partial<Omit<Address, "id" | "createdAt" | "updatedAt">> & {
        id: string;
      }
    ): Promise<Address> => {
      const response = await api.put<ApiItemResponse<Address> | Address>(
        "/address",
        data
      );

      const payload = response.data;
      if (payload && (payload as ApiItemResponse<Address>).data) {
        return (payload as ApiItemResponse<Address>).data as Address;
      }

      return payload as Address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success(t("update.success"));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("update.error"));
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  const t = useTranslations("Hooks.Addresses");

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/address/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success(t("delete.success"));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("delete.error"));
    },
  });
}
