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

export function useCompanyModules(options: UseCompanyModulesOptions = {}) {
  const { companyId, isGlobalAdmin, status } = options;

  const statusPath = buildStatusPath(status);

  const enabled = Boolean(
    (isGlobalAdmin && (statusPath !== null || !status)) ||
      (!isGlobalAdmin && companyId),
  );

  return useQuery<CompanyModuleWithDetails[]>({
    queryKey: ["company-modules", { companyId, isGlobalAdmin, status: statusPath }],
    queryFn: async (): Promise<CompanyModuleWithDetails[]> => {
      let url: string | null = null;

      if (isGlobalAdmin) {
        url =
          statusPath !== null
            ? `/companyModules/getByStatus/${statusPath}`
            : "/companyModules/GetAll";
      } else if (companyId) {
        url = `/companyModules/getByCompanyId/${companyId}`;
      }

      if (!url) return [];

      const { data } = await api.get(url);
      return (data?.data ?? data ?? []) as CompanyModuleWithDetails[];
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}



