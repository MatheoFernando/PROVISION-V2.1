"use client";

import React from "react";
import { CompanyView } from "@/components/common/dashboard/companies/company-view";
import { useCompaniesQuery } from "@/infrastructure/hooks/useCompanies";
import { Building2, Loader2 } from "lucide-react";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

interface UnifiedCompanyPageProps {
  params: Promise<{
    id: string;
    slug?: string[];
  }>;
}

export default function UnifiedCompanyPage({ params }: UnifiedCompanyPageProps) {
  const resolvedParams = React.use(params);
  const { id: slugOrId } = resolvedParams;
  const slug = resolvedParams.slug || [];
  const view = slug[0];
  const subId = slug[1];

  const { data: companies, isLoading } = useCompaniesQuery({ enabled: true });
  
  const company = React.useMemo(() => {
    if (!companies) return null;
    // Try to find by slug first, then by ID as fallback
    return companies.find(c => {
      const companySlug = slugify(c.businessName);
      return companySlug === slugOrId || c.id === slugOrId;
    }) || null;
  }, [companies, slugOrId]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-[80vh] space-y-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Carregando...</h2>
      </div>
    </div>
  ); 
  if (!company) return (
    <div className="flex items-center justify-center h-[80vh] space-y-4">
      <div className="flex flex-col items-center gap-4">
        <Building2 className="w-10 h-10 text-slate-400" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Empresa não encontrada</h2>
      </div>
    </div>
  );

  return (
    <CompanyView
      open={true}
      onClose={() => {}} 
      company={company}
      view={view}
      subId={subId}
      mode="page"
    />
  );
}
