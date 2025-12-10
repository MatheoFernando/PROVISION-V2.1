"use client"

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCompaniesQuery } from "@/infrastructure/hooks/useCompanies";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface CompanySelectProps {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  onCompanyCreated?: () => void;
}

export function CompanySelect({ value, onChange, required = false, disabled = false, onCompanyCreated }: CompanySelectProps) {
  const t = useTranslations("Components.CompanySelect");
  const { data: companies = [], isLoading } = useCompaniesQuery();
  const [search, setSearch] = useState("");
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin);
  const router = useRouter();

  const filtered = search
    ? companies.filter((c: any) => c.businessName?.toLowerCase().includes(search.toLowerCase()))
    : companies;

  const handleCreateCompany = () => {
    // Store callback for after company creation
    if (onCompanyCreated) {
      sessionStorage.setItem('returnToUserCreate', 'true');
    }
    router.push('/dashboard/empresa/create');
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <Select value={value} onValueChange={onChange} disabled={isLoading || disabled} required={required}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a empresa" />
          </SelectTrigger>
          {isLoading && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
          <SelectContent>
            <div className="p-2 sticky top-0 bg-popover z-10">
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar..."
                className="h-8 text-xs"
                disabled={isLoading || companies.length === 0}
                autoFocus
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">
                {search ? "Nenhum resultado" : "Sem empresas"}
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {filtered.map((company: any) => (
                  <SelectItem key={company.id} value={company.id!}>
                    {company.businessName}
                  </SelectItem>
                ))}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
      {isGlobalAdmin && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 cursor-pointer"
          onClick={handleCreateCompany}
          title="Criar nova empresa"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
