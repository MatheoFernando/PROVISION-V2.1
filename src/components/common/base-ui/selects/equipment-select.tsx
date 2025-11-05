"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useEquipment } from "@/infrastructure/hooks/useEquipment"

interface EquipmentSelectProps {
  value?: string
  onChange: (value: string) => void
}

export function EquipmentSelect({ value, onChange }: EquipmentSelectProps) {
  const [query, setQuery] = useState("")
  const { data: equipments = [], isLoading } = useEquipment()

  const list = Array.isArray(equipments) ? equipments : []
  const filtered = list.filter((e: any) =>
    String(e?.cod ?? e?.model ?? e?.mark ?? "")
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <div className="flex-1 min-w-0 relative">
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full ">
          <SelectValue placeholder="Selecione o equipamento" />
        </SelectTrigger>
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        )}
        <SelectContent className="w-[var(--radix-select-trigger-width)] ">
          <div className="p-2 sticky top-0 bg-popover">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar equipamentos..."
              className="w-full"
              disabled={isLoading || list.length === 0}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground p-3 text-center">Não há dados disponíveis.</div>
          ) : (
            <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
              {filtered.map((e: any) => (
                <SelectItem key={e.id} value={e.id!} className="cursor-pointer">
                  <span className="truncate">{e.cod || e.model || e.mark}</span>
                </SelectItem>
              ))}
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}


