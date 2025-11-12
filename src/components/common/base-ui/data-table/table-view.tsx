"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  type RowData,
  type Table as ReactTable,
} from "@tanstack/react-table";

interface TableViewProps<TData extends RowData> {
  table: ReactTable<TData>;
  isLoading?: boolean;
  colSpan: number;
}

export function TableView<TData extends RowData>({
  table,
  isLoading = false,
  colSpan,
}: TableViewProps<TData>) {
  return (
    <div className="w-full overflow-x-auto pb-0 mb-0">
      <Table className="w-full">
        <TableHeader className="bg-muted/30 dark:bg-muted/20">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  className="whitespace-nowrap text-sm font-medium text-muted-foreground"
                  style={{
                    width: header.getSize?.() ?? undefined,
                    minWidth: 38,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span className="text-sm text-muted-foreground">carregando dados…</span>
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-b border-border hover:bg-muted/50 dark:hover:bg-muted/30 data-[state=selected]:bg-muted"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="py-0 text-sm text-foreground"
                    style={{
                      width: cell.column.getSize?.() ?? undefined,
                      minWidth: 48,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={colSpan}
                className="h-24 w-full text-center text-muted-foreground"
              >
                <div className="flex flex-col items-center justify-center gap-2 w-full">
                  <span>Sem resultados.</span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
