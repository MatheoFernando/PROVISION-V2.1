"use client"

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCompaniesQuery } from "@/infrastructure/hooks/useCompanies";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useRouter } from "next/navigation";

interface CompanySelectProps {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  onCompanyCreated?: () => void;
}

export function CompanySelect({ value, onChange, required = false, onCompanyCreated }: CompanySelectProps) {
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
    router.push('/dashboard/companies/create');
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Select value={value} onValueChange={onChange} disabled={isLoading} required={required}>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Selecione a empresa" />
          </SelectTrigger>
          {isLoading && (
            <Loader2 className="animate-spin w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
          )}
          <SelectContent>
            <div className="px-3 pt-2 pb-1 border-b bg-background sticky top-0 z-10">
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar empresa..."
                className="h-8 text-sm placeholder:font-normal"
                disabled={isLoading || companies.length === 0}
                autoFocus
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 text-center">Nenhum dado encontrado</div>
            ) : (
              <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
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
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
