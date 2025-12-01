import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useEmployees } from "@/infrastructure/hooks/useEmployees";
import type { Employee } from "@/infrastructure/types/domain";
import EmployeesCreatePage from "@/components/common/dashboard/employees/employee-create";

interface EmployeeSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
}

export function EmployeeSelect({ value, onChange, companyId }: EmployeeSelectProps) {
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createdEmployees, setCreatedEmployees] = useState<
    Array<Employee & { createdAt?: string }>
  >([]);

  const { data: employees = [], isLoading, refetch } = useEmployees(companyId);

  const list: Array<Employee & { createdAt?: string }> = (() => {
    const baseList = Array.isArray(employees) ? employees : [];
    const merged: Array<Employee & { createdAt?: string }> = [
      ...createdEmployees,
      ...baseList,
    ];
    const map = new Map<string, Employee & { createdAt?: string }>();
    merged.forEach((employee) => {
      if (!employee?.id) return;
      map.set(employee.id, {
        ...employee,
        id: employee.id,
        fullName: employee.fullName ?? "",
        createdAt:
          (employee as Employee & { createdAt?: string }).createdAt ??
          new Date().toISOString(),
      });
    });
    return Array.from(map.values()).sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  })();

  const filtered = list.filter((e) =>
    String(e?.fullName ?? "")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const handleCloseDrawer = () => {
    setIsCreateOpen(false);
  };

  const handleCreateSuccess = () => {
    handleCloseDrawer();
    void refetch();
  };

  return (
    <>
      <div className="flex items-stretch gap-2 w-full">
        <div className="flex-1 min-w-0 relative">
          <Select
            value={value}
            onValueChange={onChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full ">
              <SelectValue placeholder="Selecione o funcionário" />
            </SelectTrigger>
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
            <SelectContent className="w-[var(--radix-select-trigger-width)] ">
              <div className="p-1 sticky top-0 bg-popover">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrar funcionários..."
                  className="w-full placeholder:text-xs"
                  disabled={isLoading || list.length === 0}
                />
              </div>
              {filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 text-center">
                  Não há dados disponíveis.
                </div>
              ) : (
                <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                  {filtered.map((e) => (
                    <SelectItem key={e.id} value={e.id!} className="cursor-pointer">
                      <span className="truncate">{e.fullName}</span>
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
          className="shrink-0 cursor-pointer"
          onClick={() => setIsCreateOpen(true)}
          aria-label="Criar funcionário"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Drawer
        open={isCreateOpen}
        onOpenChange={(open) => (open ? setIsCreateOpen(true) : handleCloseDrawer())}
        direction="right"
      >
        <DrawerContent className="h-full w-full sm:max-w-xl">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DrawerTitle className="text-2xl font-bold text-foreground">
                    Novo Funcionário
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
              <EmployeesCreatePage
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
