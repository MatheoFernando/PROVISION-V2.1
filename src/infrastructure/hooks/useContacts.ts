import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { api } from "../utils/api";
import { toast } from "sonner";
import { Contact } from "../types/domain";

export function useContacts(): UseQueryResult<Contact[]>;
export function useContacts(companyId?: string): UseQueryResult<Contact[]>;
export function useContacts(companyId?: string) {
  return useQuery({
    queryKey: ["contacts", companyId],
    queryFn: async (): Promise<Contact[]> => {
      const { data } = await api.get("/contact/getAll");
      return (data?.data ?? []) as Contact[];
    },
  });
}

export function useContactsByEmail(email: string) {
  return useQuery({
    queryKey: ["contacts", "email", email],
    queryFn: async (): Promise<Contact[]> => {
      const { data } = await api.get(`/contact/email`, { params: { email } });
      return (data?.data ?? []) as Contact[];
    },
    enabled: !!email,
  });
}

export function useContactById(id?: string) {
  return useQuery({
    queryKey: ["contact", id],
    queryFn: async (): Promise<Contact | null> => {
      if (!id) return null;
      const { data } = await api.get(`/contact/getById/${id}`);
      return data || null;
    },
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Omit<Contact, "id" | "createdAt" | "updatedAt">
    ): Promise<Contact> => {
      const response = await api.post("/contact/create", payload);
      return response.data;
    },
    onSuccess: (_created, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contacts", (variables as Contact).companyId],
      });
      toast.success("Contato criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao criar contato");
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Partial<Omit<Contact, "id" | "createdAt" | "updatedAt">> & {
        id: string;
      }
    ): Promise<Contact> => {
      const response = await api.put("/contact", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contato atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao atualizar contato");
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/contact/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contato excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao excluir contato");
    },
  });
}



