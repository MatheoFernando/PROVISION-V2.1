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
import { Plus } from "lucide-react";
import {
  useCustomers
} from "@/infrastructure/hooks/useCustomers";

export function CustomerSelect({ value, onChange }: { value?: string; onChange: (value: string) => void; companyId: string; }) {
  const router = useRouter();
  const { data: customers = [], isLoading } = useCustomers();
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um cliente" />
        </SelectTrigger>
        <SelectContent>
          {customers.map((c: any) => (
            <SelectItem key={c.id} value={c.id!}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => router.push("/dashboard/customers/create")}
        className="cursor-pointer"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
