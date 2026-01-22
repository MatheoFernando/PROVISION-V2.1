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
import { useUsers } from "@/infrastructure/hooks/useUsers";
import type { User } from "@/infrastructure/types/domain";

interface UserSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string;
}

export function UserSelect({ value, onChange, companyId }: UserSelectProps) {
  const [query, setQuery] = useState("");
  const { users, isLoading } = useUsers(companyId);

  const list: User[] = Array.isArray(users) ? users : [];

  const filtered = list.filter((user) => {
    const phone = String(user.phone ?? "").toLowerCase();
    const employeeName = String(user.employee?.fullName ?? "").toLowerCase();
    const term = query.toLowerCase();
    if (!term) return true;
    return phone.includes(term) || employeeName.includes(term);
  });

  return (
    <div className="flex-1 min-w-0 relative">
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o utilizador" />
        </SelectTrigger>
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        )}
        <SelectContent className="w-[var(--radix-select-trigger-width)]">
          <div className="p-1 sticky top-0 bg-popover">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar utilizadores..."
              className="w-full placeholder:text-xs"
              disabled={isLoading || list.length === 0}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground p-3 text-center">
              Não há dados disponíveis.
            </div>
          ) : (
            <div
              className={
                filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"
              }
            >
              {filtered.map((user) => (
                <SelectItem key={user.id} value={user.id!}>
                  <span className="truncate">
                    {user.employee?.fullName
                      ? `${user.employee.fullName} — ${user.phone}`
                      : user.phone}
                  </span>
                </SelectItem>
              ))}
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}


