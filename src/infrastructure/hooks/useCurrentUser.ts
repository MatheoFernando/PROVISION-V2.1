"use client";

import { useAuthStore } from "./useAuthStore";

export function useCurrentUser() {
  const userData = useAuthStore((state) => state.userData);
  const companyId = useAuthStore((state) => state.companyId);
  const userId = useAuthStore((state) => state.userId);
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin);

  return {
    userData,
    companyId,
    userId,
    isGlobalAdmin,
    fullName: userData?.fullName ?? null,
    email: userData?.email ?? null,
    phone: userData?.phone ?? null,
    companyName: userData?.companyName ?? null,
    departmentName: userData?.departmentName ?? null,
    role: userData?.role ?? null,
    hasCompany: userData?.hasCompany ?? false,
  };
}

