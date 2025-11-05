"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { flexRender, type RowData, type Table as ReactTable } from "@tanstack/react-table"

interface TableViewProps<TData extends RowData> {
  table: ReactTable<TData>
  isLoading?: boolean
  colSpan: number
}

export function TableView<TData extends RowData>({ table, isLoading = false, colSpan }: TableViewProps<TData>) {
  return (
    <div className="w-full overflow-x-auto pb-0 mb-0">
      <Table className="w-full  ">
        <TableHeader className="bg-muted/30 ">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  className="text-slate-600 font-medium text-sm  whitespace-nowrap"
                  style={{ minWidth: 80 }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="border-b border-border">
                {table.getHeaderGroups()?.[0]?.headers.map((header, cellIndex) => (
                  <TableCell key={cellIndex} className="py-0.5" style={{ minWidth: 80 }}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-b border-border  hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-0.5 text-sm text-foreground" style={{ minWidth: 80 }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 w-full text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2 w-full">
                 
                  <span>Sem resultados.</span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}


