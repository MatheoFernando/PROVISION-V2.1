"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/infrastructure/utils/api";
import type {
  Company,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "@/infrastructure/types/domain";
import type {
  CompanyModuleWithDetails,
  UpdateCompanyModule,
  CompanyModule,
  CreateCompanyModule,
} from "@/infrastructure/schema/schema-company-module";
import { toast } from "sonner";
import { z } from "zod";
import { companySchema } from "@/infrastructure/schema/schema-company";

export function useCompaniesQuery(options?: { enabled?: boolean }) {
  return useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async (): Promise<Company[]> => {
      const { data } = await api.get("/company/GetAll");

      return data?.data ?? data ?? [];
    },
    enabled: options?.enabled ?? true,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
}

export function useCompanyByIdQuery(id?: string) {
  return useQuery<Company | null>({
    queryKey: ["company", id],
    queryFn: async (): Promise<Company | null> => {
      if (!id) return null;
      const { data } = await api.get(`/company/${id}`);
      const parsed = companySchema.safeParse(data?.data ?? data);
      if (!parsed.success) throw new Error("Falha ao validar empresa");
      return parsed.data as Company;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useCompanyByCodQuery(cod?: string) {
  return useQuery<Company | null>({
    queryKey: ["company-cod", cod],
    queryFn: async (): Promise<Company | null> => {
      if (!cod) return null;
      const { data } = await api.get(`/company/cod/${cod}`);
      const parsed = companySchema.safeParse(data?.data ?? data);
      if (!parsed.success) throw new Error("Falha ao validar empresa");
      return parsed.data as Company;
    },
    enabled: !!cod,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useCompaniesByNameQuery(name?: string) {
  return useQuery<Company[]>({
    queryKey: ["companies-name", name],
    queryFn: async (): Promise<Company[]> => {
      if (!name) return [];
      const { data } = await api.get("/company/name", { params: { name } });
      const listSchema = z.array(companySchema);
      const parsed = listSchema.safeParse(data?.data ?? data);
      if (!parsed.success)
        throw new Error("Falha ao validar empresas por nome");
      return parsed.data as Company[];
    },
    enabled: !!name,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useCompanyModulesByModuleQuery(moduleId: string) {
  return useQuery({
    queryKey: ["company-modules", "module", moduleId],
    queryFn: async (): Promise<CompanyModuleWithDetails[]> => {
      const response = await api.get(`/company-modules/${moduleId}`);
      return response.data;
    },
    enabled: !!moduleId,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useCompanyModuleByIdQuery(companyModuleId?: string | null) {
  return useQuery<CompanyModuleWithDetails | null>({
    queryKey: ["company-module", companyModuleId],
    queryFn: async (): Promise<CompanyModuleWithDetails | null> => {
      if (!companyModuleId) return null;
      const { data } = await api.get(`/companyModules/${companyModuleId}`);
      return (data?.data ?? data ?? null) as CompanyModuleWithDetails | null;
    },
    enabled: Boolean(companyModuleId),
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useCreateCompanyModuleMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; data?: CompanyModule },
    unknown,
    CreateCompanyModule
  >({
    mutationKey: ["company-module-create"],
    mutationFn: async (payload: CreateCompanyModule) => {
      const body = {
        ...payload,
        status: String(payload.status),
      } as Record<string, unknown>;
      const { data } = await api.post("/companyModules/create", body);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["company-modules"] });
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      await queryClient.refetchQueries({ queryKey: ["companies"], type: "active" });
      toast.success("Serviço associado à empresa com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao associar serviço à empresa", error);
      toast.error("Erro ao associar serviço à empresa");
    },
  });
}

export function useUpdateCompanyModuleMutation() {
  const queryClient = useQueryClient();

  interface UpdatePayload extends UpdateCompanyModule {
    id: string;
    status?: boolean;
  }

  return useMutation<
    { message: string; data?: CompanyModule },
    unknown,
    UpdatePayload
  >({
    mutationKey: ["company-module-update"],
    mutationFn: async (payload: UpdatePayload) => {
      const { id, status, ...rest } = payload;

      const body: Record<string, unknown> = {
        id,
        ...rest,
      };

      if (typeof status === "boolean") {
        body.status = String(status);
      } else if (typeof rest.isActive === "boolean") {
        body.status = String(rest.isActive);
      }

      const { data } = await api.put("/companyModules", body);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["company-modules"] });
      await queryClient.refetchQueries({
        queryKey: ["company-modules"],
        type: "active",
      });
      toast.success("Serviço da empresa atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar serviço da empresa");
    },
  });
}

export function useDeleteCompanyModuleMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, unknown, string>({
    mutationKey: ["company-module-delete"],
    mutationFn: async (companyModuleId: string) => {
      const { data } = await api.delete(`/companyModules/${companyModuleId}`);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["company-modules"] });
      await queryClient.refetchQueries({
        queryKey: ["company-modules"],
        type: "active",
      });
      toast.success("Serviço desassociado da empresa com sucesso");
    },
    onError: () => {
      toast.error("Erro ao desassociar serviço da empresa");
    },
  });
}

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; data?: Company },
    unknown,
    CreateCompanyPayload
  >({
    mutationKey: ["company-create"],
    mutationFn: async (payload: CreateCompanyPayload) => {
      const { data } = await api.post("/company/create", payload);
      return data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      await queryClient.refetchQueries({ queryKey: ["companies"], type: "active" });
      toast.success("Empresa criada com sucesso");
    },
    onError: (error) => {
      console.log("Erro ao criar empresa", error);
      toast.error("Erro ao criar empresa");
    },
  });
}

export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; data?: Company },
    unknown,
    UpdateCompanyPayload
  >({
    mutationKey: ["company-update"],
    mutationFn: async (payload: UpdateCompanyPayload) => {
      const { data } = await api.put("/company", payload);
      return data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      await queryClient.refetchQueries({ queryKey: ["companies"], type: "active" });
      toast.success("Empresa atualizada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar empresa");
    },
  });
}

export function useDeleteCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, unknown, string>({
    mutationKey: ["company-delete"],
    mutationFn: async (companyId: string) => {
      const { data } = await api.delete(`/company/${companyId}`);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      await queryClient.refetchQueries({ queryKey: ["companies"], type: "active" });
      toast.success("Empresa excluída com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir empresa");
    },
  });
}




export function useCompanies() {
  const companiesQuery = useCompaniesQuery();
  const createCompany = useCreateCompanyMutation();
  const updateCompany = useUpdateCompanyMutation();
  const deleteCompany = useDeleteCompanyMutation();

  return {
    companies: companiesQuery.data ?? [],
    isLoading: companiesQuery.isLoading,
    isError: companiesQuery.isError,
    error: companiesQuery.error,

    isCreating: createCompany.isPending,
    isUpdating: updateCompany.isPending,
    isDeleting: deleteCompany.isPending,

    createCompany: createCompany.mutateAsync,
    updateCompany: updateCompany.mutateAsync,
    deleteCompany: deleteCompany.mutateAsync,

    refetch: companiesQuery.refetch,
  };
}
