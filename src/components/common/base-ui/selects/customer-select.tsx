// src/components/common/base-ui/selects/customer-select.tsx
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCustomers } from "@/infrastructure/hooks/useCustomers";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { Customer } from "@/infrastructure/types/domain";
import { CustomersCreateForm } from "@/components/common/dashboard/customers/customer-create";

interface CustomerSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string;
  disabled?: boolean;
}

export function CustomerSelect({ value, onChange, disabled }: CustomerSelectProps) {
  const { data: customers = [], isLoading, refetch } = useCustomers();
  const [search, setSearch] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createdCustomers, setCreatedCustomers] = React.useState<
    Array<Customer & { createdAt?: string }>
  >([]);

  const customersList = React.useMemo<Customer[]>(() => {
    const baseList = Array.isArray(customers) ? customers : [];

    const merged: Array<Customer & { createdAt?: string }> = [
      ...createdCustomers,
      ...baseList,
    ];

    const map = new Map<string, Customer & { createdAt?: string }>();
    merged.forEach((customer) => {
      if (!customer?.id) return;
      map.set(customer.id, {
        ...customer,
        id: customer.id,
        name: customer.name ?? "",
        createdAt:
          (customer as Customer & { createdAt?: string }).createdAt ??
          new Date().toISOString(),
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [customers, createdCustomers]);

  const filtered = React.useMemo(() => {
    const keyword = search.toLowerCase();
    return customersList.filter((customer) =>
      customer.name?.toLowerCase().includes(keyword)
    );
  }, [customersList, search]);

  const handleCloseDrawer = () => {
    setIsCreateOpen(false);
  };

  const handleCreateSuccess = (customer?: Customer) => {
    handleCloseDrawer();

    if (customer?.id) {
      const customerWithMeta = customer as Customer & { createdAt?: string };
      const normalizedCustomer: Customer & { createdAt?: string } = {
        ...customerWithMeta,
        id: customer.id,
        name: customer.name ?? "",
        createdAt: customerWithMeta.createdAt ?? new Date().toISOString(),
      };

      setCreatedCustomers((prev) => {
        if (prev.some((item) => item.id === customer.id)) return prev;
        return [normalizedCustomer, ...prev];
      });

      onChange(customer.id);
      void refetch();
    } else {
      void refetch();
    }
  };

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
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
            <SelectContent className="w-[var(--radix-select-trigger-width)]">
              <div className="p-2 sticky top-0 bg-popover">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Filtrar clientes..."
                  className="w-full"
                  disabled={isLoading || customersList.length === 0}
                />
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
                        className="cursor-pointer"
                      >
                        {customer.name}
                      </SelectItem>
                    );
                  })}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsCreateOpen(true)}
          className="cursor-pointer shrink-0"
          aria-label="Criar cliente"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Drawer
        open={isCreateOpen}
        onOpenChange={(open) =>
          open ? setIsCreateOpen(true) : handleCloseDrawer()
        }
        direction="right"
      >
        <DrawerContent className="h-full w-full sm:max-w-xl">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DrawerTitle className="text-2xl font-bold text-foreground">
                    Novo Cliente
                  </DrawerTitle>
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <CustomersCreateForm
                onSuccess={handleCreateSuccess}
                onCancel={handleCloseDrawer}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
