"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

interface SelectSearchableWithCreateProps<T> {
  value?: string;
  onValueChange: (value: string) => void;
  options: T[];
  getValue: (item: T) => string;
  getLabel: (item: T) => string;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  companyId?: string;
  onOpenCreateModal?: () => void;
  onCreateSuccess?: (id: string) => void;
}

export function SelectSearchableWithCreate<T>(props: SelectSearchableWithCreateProps<T>) {
  const { value, onValueChange, options, getValue, getLabel, label, placeholder, required, error, onOpenCreateModal } = props;
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return options.filter((o) => getLabel(o).toLowerCase().includes(s));
  }, [options, search, getLabel]);

  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium">{label}{required ? " *" : ""}</Label>
      <Input
        placeholder={placeholder || "Pesquisar"}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 border-gray-200 focus:border-black focus:ring-black"
      />
      <select
        className="h-9 w-full border rounded px-2"
        value={value || ""}
        onChange={(e) => onValueChange(e.target.value)}
      >
        <option value="" disabled>
          {placeholder || "Selecione"}
        </option>
        {filtered.map((item, idx) => (
          <option key={idx} value={getValue(item)}>
            {getLabel(item)}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {onOpenCreateModal && (
        <div className="pt-1">
          <Button type="button" variant="outline" className="h-8" onClick={onOpenCreateModal}>
            Criar novo
          </Button>
        </div>
      )}
    </div>
  );
}



