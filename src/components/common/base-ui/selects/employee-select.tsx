import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useEmployees } from "@/infrastructure/hooks/useEmployees";
import type { Employee } from "@/infrastructure/types/domain";

interface EmployeeSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId: string;
}

export function EmployeeSelect({ value, onChange, companyId }: EmployeeSelectProps) {
  const [query, setQuery] = useState("");

  const { data: employees = [], isLoading, refetch } = useEmployees(companyId);

  const list: Array<Employee & { createdAt?: string }> = (() => {
    const baseList = Array.isArray(employees) ? employees : [];
    const merged: Array<Employee & { createdAt?: string }> = [
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

  const selectedEmployee = list.find((e) => e.id === value);

  const filtered = list.filter((e) =>
    String(e?.fullName ?? "")
      .toLowerCase()
      .includes(query.toLowerCase()) ||
    String(e?.cod ?? "")
      .toLowerCase()
      .includes(query.toLowerCase())
  );


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
              <SelectValue placeholder="Selecione o responsável">
                {selectedEmployee ? (
                  <span>
                    <span>{selectedEmployee.cod || '---'}</span> - {selectedEmployee.fullName}
                  </span>
                ) : (
                  "Selecione o responsável"
                )}
              </SelectValue>
            </SelectTrigger>
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
            <SelectContent className="w-[var(--radix-select-trigger-width)] ">
              <div className="p-1 sticky top-0 bg-popover border-b">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrar responsáveis..."
                  className="w-full placeholder:text-xs"
                  disabled={isLoading || list.length === 0}
                />
              </div>

              <div className="pl-8 pr-2 bg-muted/50 border-b sticky top-10 z-10">
                <div className="grid grid-cols-[100px_1fr] w-full">
                  <div className="px-2 py-2 text-xs font-semibold border-r border-border/50">Código</div>
                  <div className="px-2 py-2 text-xs font-semibold">Nome do Funcionário</div>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 text-center">
                  Não há dados disponíveis.
                </div>
              ) : (
                <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                  {filtered.map((e) => (
                    <SelectItem
                      key={e.id}
                      value={e.id!}
                      textValue={`${e.cod || '---'} - ${e.fullName}`}
                      className="cursor-pointer border-b last:border-b-0 hover:bg-accent"
                    >
                      <div className="grid grid-cols-[100px_1fr] w-full items-center">
                        <span className="px-2 text-sm border-r border-border/50 truncate">
                          {e.cod || '---'}
                        </span>
                        <span className="px-2 truncate">
                          {e.fullName}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

      </div>


    </>
  );
}

