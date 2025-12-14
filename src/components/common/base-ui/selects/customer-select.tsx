
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {  Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCustomersByCompanyId } from "@/infrastructure/hooks/useCustomers";
import type { Customer } from "@/infrastructure/types/domain";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";

interface CustomerSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string;
  disabled?: boolean;
}

export function CustomerSelect({ value, onChange, disabled, companyId: propCompanyId }: CustomerSelectProps) {
  const storeCompanyId = useAuthStore((state) => state.companyId);
  const companyId = propCompanyId || storeCompanyId;

  const { data: customers = [], isLoading } = useCustomersByCompanyId(
    companyId || "",
    { enabled: !!companyId }
  );
  const [search, setSearch] = React.useState("");

  const customersList = React.useMemo<Customer[]>(() => {
    const baseList = Array.isArray(customers) ? customers : [];

    const merged: Array<Customer> = [
      ...baseList,
    ];

    return merged;
  }, [customers]);

  const selectedCustomer = React.useMemo(() =>
    customersList.find((c) => c.id === value),
    [customersList, value]);

  const filtered = React.useMemo(() => {
    const keyword = search.toLowerCase();
    return customersList.filter((customer) =>
      customer.name?.toLowerCase().includes(keyword) ||
      customer.cod?.toLowerCase().includes(keyword)
    );
  }, [customersList, search]);



  return (
    <>
      <div className="flex items-stretch gap-2 w-full">
        <div className="flex-1 min-w-0 relative">
          <Select
            value={value}
            onValueChange={onChange}
            disabled={isLoading || disabled}
          >
            <SelectTrigger className="w-full ">
              <SelectValue placeholder="Selecione um cliente">
                {selectedCustomer ? (
                  <span>
                    <span>{selectedCustomer.cod || '---'}</span> - {selectedCustomer.name}
                  </span>
                ) : (
                  "Selecione um cliente"
                )}
              </SelectValue>
            </SelectTrigger>
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
            <SelectContent className="w-[var(--radix-select-trigger-width)]">
              <div className="p-2 sticky top-0 bg-popover border-b">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Filtrar clientes..."
                  className="w-full"
                  disabled={isLoading || customersList.length === 0}
                />
              </div>

              <div className="pl-2 pr-2 bg-muted/50 border-b sticky top-10 z-10">
                <div className="grid grid-cols-[100px_1fr] w-full">
                  <div className="px-2 py-2 text-xs font-semibold border-r border-border/50">Código</div>
                  <div className="px-2 py-2 text-xs font-semibold">Nome do Cliente</div>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 text-center">
                  Não há dados disponíveis.
                </div>
              ) : (
                <div
                  className={
                    filtered.length > 7
                      ? "max-h-60 overflow-y-auto"
                      : "max-h-full"
                  }
                >
                  {filtered.map((customer) => {
                    if (!customer?.id) return null;
                    return (
                      <SelectItem
                        key={customer.id}
                        value={customer.id}
                        textValue={`${customer.cod || '---'} - ${customer.name}`}
                        className="cursor-pointer border-b last:border-b-0 hover:bg-accent"
                      >
                        <div className="grid grid-cols-[100px_1fr] w-full items-center">
                          <span className="px-2 text-sm border-r border-border/50 truncate">
                            {customer.cod || '---'}
                          </span>
                          <span className="px-2 truncate">
                            {customer.name}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      
      </div>

      
    </>
  );
}
