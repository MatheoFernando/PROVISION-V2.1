"use client";

import { DashboardAdmin } from "@/components/common/base-ui/dashboard-admin";
import { SuperAdminDashboard } from "@/components/common/base-ui/super-admin";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";

function Page() {
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin);

  return (
    <div>
      {isGlobalAdmin ? <SuperAdminDashboard /> : <DashboardAdmin />}
    </div>
  );
}

export default Page;
