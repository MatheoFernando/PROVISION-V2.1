"use client";

import { CreateService } from "@/components/common/dashboard/services/create-service";
import { DefaultServices } from "@/components/common/dashboard/services/default-services";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";

export default function ServicePage() {
  const { isGlobalAdmin } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
        {isGlobalAdmin && <CreateService />}
      </div>
      <DefaultServices />
    </div>
  );
}
