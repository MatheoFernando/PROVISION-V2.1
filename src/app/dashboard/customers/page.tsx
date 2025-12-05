"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { CustomersTable } from "@/components/common/dashboard/customers/customers-table";

export default function CustomersPage() {
  const router = useRouter();
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin);

  useEffect(() => {
    if (isGlobalAdmin) {
      router.push("/dashboard/companies");
    }
  }, [isGlobalAdmin, router]);

  if (isGlobalAdmin) {
    return null;
  }

  return  <CustomersTable />

}
