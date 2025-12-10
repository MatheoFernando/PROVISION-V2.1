"use client";

import { useState } from "react";
import { AdminServicesTabs } from "@/components/common/dashboard/services/services-tabs";
import { Separator } from "@/components/ui/separator";
import { useAllCompanyModules } from "@/infrastructure/hooks/useCompanyModules";
export default function ModulesServicesPage() {
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { data, isLoading, isError } = useAllCompanyModules({
    status: statusFilter,
  });
  console.log(data);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Módulos e Serviços</h3>
                <p className="text-sm text-muted-foreground">

                    Gerencie os módulos do sistema e associações com empresas.
                </p>

            </div>
            <Separator />

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
