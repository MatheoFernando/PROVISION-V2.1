import { useQuery } from "@tanstack/react-query";
import { api } from "@/infrastructure/utils/api";
import type { CompanyModuleWithDetails } from "@/infrastructure/schema/schema-company-module";

interface UseCompanyModulesOptions {
  companyId?: string | null;
  isGlobalAdmin?: boolean | null;
  status?: string | boolean | null;
}

function buildStatusPath(status?: string | boolean | null): string | null {
  if (status === null || status === undefined || status === "" || status === "all")
    return null;

  if (typeof status === "boolean") return status ? "true" : "false";

  const normalized = status.toString().toLowerCase();
  if (normalized === "true" || normalized === "1") return "true";
  if (normalized === "false" || normalized === "0") return "false";

  return status.toString();
}

interface UseCompanyModulesOptions {
  companyId?: string | null;
  status?: string | boolean | null;
  enabled?: boolean;
}

export function useCompanyModules(options: UseCompanyModulesOptions = {}) {
  const { companyId, status, enabled = true } = options;

  const statusPath = buildStatusPath(status);
  const isEnabled = Boolean(companyId && enabled);

  return useQuery<CompanyModuleWithDetails[]>({
    queryKey: ["company-modules", { companyId, status: statusPath }],
    queryFn: async (): Promise<CompanyModuleWithDetails[]> => {
      if (!companyId) return [];

      const url = `/companyModules/getByCompanyId/${companyId}`;
      const { data } = await api.get(url);

      let modules = (data?.data ?? data ?? []) as CompanyModuleWithDetails[];


      if (statusPath !== null) {
        const isActive = statusPath === "true";
        modules = modules.filter(m => {
          const mStatus = (m as any).status ?? m.isActive;
          const mActive = typeof mStatus === 'string' ? (mStatus === 'true' || mStatus === '1') : Boolean(mStatus);
          return mActive === isActive;
        });
      }
      return modules;
    },
    enabled: isEnabled,
   
  });
}

interface UseAllCompanyModulesOptions {
  status?: string | boolean | null;
  enabled?: boolean;
}

export function useAllCompanyModules(options: UseAllCompanyModulesOptions = {}) {
  const { status, enabled = true } = options;
  const statusPath = buildStatusPath(status);

  return useQuery<CompanyModuleWithDetails[]>({
    queryKey: ["all-company-modules", { status: statusPath }],
    queryFn: async (): Promise<CompanyModuleWithDetails[]> => {
      const url = statusPath !== null
        ? `/companyModules/getByStatus/${statusPath}`
        : "/companyModules/GetAll";

      const { data } = await api.get(url);
      return (data.data ?? data ?? []) as CompanyModuleWithDetails[];
    },
    enabled,
    refetchOnReconnect: true,
  });
}



