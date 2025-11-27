// src/components/common/base-ui/selects/customer-select.tsx
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  useCustomers
} from "@/infrastructure/hooks/useCustomers";

export function CustomerSelect({ value, onChange, disabled }: { value?: string; onChange: (value: string) => void; companyId: string; disabled?: boolean; }) {
  const router = useRouter();
  const { data: customers = [], isLoading } = useCustomers();
  const [search, setSearch] = useState("");
  const list = Array.isArray(customers) ? customers : [];
  const filtered = search
    ? list.filter((c: any) => String(c?.name ?? "").toLowerCase().includes(search.toLowerCase()))
    : list;
  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select value={value} onValueChange={onChange} disabled={isLoading || disabled}>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-2 sticky top-0 bg-popover">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar clientes..."
                className="w-full"
                disabled={isLoading || list.length === 0}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">Não há dados disponíveis.</div>
            ) : (
              <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                {filtered.map((c: any) => (
                  <SelectItem key={c.id} value={c.id!}>
                    {c.name}
                  </SelectItem>
                ))}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => router.push("/dashboard/customers")}
        className="cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
