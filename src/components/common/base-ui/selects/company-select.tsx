import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCompaniesQuery } from "@/infrastructure/hooks/useCompanies";

interface CompanySelectProps {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function CompanySelect({ value, onChange, required = false }: CompanySelectProps) {
  const { data: companies = [], isLoading } = useCompaniesQuery();
  const [search, setSearch] = useState("");

  const filtered = search
    ? companies.filter((c: any) => c.businessName?.toLowerCase().includes(search.toLowerCase()))
    : companies;

  return (
    <div className="relative">
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
  );
}
