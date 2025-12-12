"use client";

import { useState } from "react";
import { AdminServicesTabs } from "@/components/common/dashboard/services/services-tabs";
import { useAllCompanyModules } from "@/infrastructure/hooks/useCompanyModules";
export default function ModulesServicesPage() {
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { data, isLoading, isError } = useAllCompanyModules({
    status: statusFilter,
  });

    return (
        <div>
       
            <AdminServicesTabs
                companyModules={data ?? []}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                isLoading={isLoading}
                isError={isError}
            />

        </div>
    );
}
