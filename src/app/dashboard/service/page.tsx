"use client";

import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { ListServices } from "@/components/common/dashboard/services/list-services";
import { DefaultServices } from "@/components/common/dashboard/services/default-services";

import { type ModuleSchema } from "@/infrastructure/schema/schema-module";
import { useModules } from "@/infrastructure/hooks/useModules";

export default function ServicePage() {
  const { isGlobalAdmin } = useAuthStore();
  const { data: services = [], isLoading, error } = useModules();

  if (!isGlobalAdmin) {
    return (
      <div className="space-y-6 py-6">
        <DefaultServices />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
      <p className="text-muted-foreground">
        Gerencie todos os serviços do sistema.
      </p>

      <ListServices
        services={services as ModuleSchema[]}
        isGlobalAdmin={isGlobalAdmin}
      />
    </div>
  );
}
