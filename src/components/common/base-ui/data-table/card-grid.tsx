"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { flexRender, type RowData, type Table as ReactTable } from "@tanstack/react-table"

interface CardGridProps<TData extends RowData> {
  table: ReactTable<TData>
  isLoading?: boolean
}

export function CardGrid<TData extends RowData>({ table, isLoading = false }: CardGridProps<TData>) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-4">
            <Skeleton className="h-5 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3 mb-1" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))
      ) : table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <div key={row.id} className="rounded-lg border border-border p-4 hover:bg-muted/40 transition-colors">
            <div className="space-y-1 text-sm">
              {row.getVisibleCells().map((cell) => (
                <div key={cell.id} className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">
                    {typeof cell.column.columnDef.header === "string"
                      ? cell.column.columnDef.header
                      : (cell.column.id ?? "Coluna")}
                  </span>
                  <span className="text-foreground max-w-[60%] truncate">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center text-muted-foreground py-8">Sem resultados.</div>
      )}
    </div>
  )
}


