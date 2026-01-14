"use client";

import { AuthLoader } from "../auth/auth-loader";
import { RouteGuard } from "../base-ui/route-guard";

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthLoader />
      <RouteGuard>
        {children}
      </RouteGuard>
    </>
  );
}



