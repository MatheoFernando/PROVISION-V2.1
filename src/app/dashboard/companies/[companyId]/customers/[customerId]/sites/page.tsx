"use client";

import React from "react";
import { SitesTable } from "@/components/common/dashboard/sites/sites-table";

interface CompanyCustomerSitesPageProps {
  params: {
    companyId: string;
    customerId: string;
  };
}

export default function CompanyCustomerSitesPage({
  params,
}: CompanyCustomerSitesPageProps) {
  const { customerId } = params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">
        Sites do cliente
      </h1>
      <SitesTable customerId={customerId} />
    </div>
  );
}


