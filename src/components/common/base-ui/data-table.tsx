"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  type RowData,
  useReactTable,
  type Table as ReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Columns, Plus, Eye, MoreHorizontal, CircleAlert } from "lucide-react"

interface ActionButton<TData> {
  label: string
  icon?: React.ReactNode
  onClick: (row: TData) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

interface DataTableProps<TData extends RowData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  searchKey?: keyof TData & string
  placeholder?: string
  enableRowSelection?: boolean
  actionButton?: { label: string; onClick?: () => void; component?: React.ReactNode }
  rowActions?: ActionButton<TData>[]
  toolbar?: (table: ReactTable<TData>) => React.ReactNode
  includeSelection?: boolean
  isLoading?: boolean
}

export function DataTableGeneric<TData extends RowData, TValue>({
  data,
  columns,
  searchKey,
  placeholder = "Pesquisar...",
  enableRowSelection = false,
  actionButton,
  rowActions,
  toolbar,
  includeSelection = false,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })

  const columnsWithSelection = React.useMemo<ColumnDef<TData, any>[]>(() => {
    let finalColumns = columns
    
    if (includeSelection) {
      finalColumns = [createSelectionColumn<TData>(), ...finalColumns]
    }
    
    if (rowActions && rowActions.length > 0) {
      finalColumns = [...finalColumns, createActionsColumn<TData>(rowActions)]
    }
    
    return finalColumns
  }, [columns, includeSelection, rowActions])

  const table = useReactTable<TData>({
    data,
    columns: columnsWithSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: includeSelection || enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, filter) => {
      if (!searchKey) return true
      const value = row.original?.[searchKey]
      return String(value ?? "").toLowerCase().includes(String(filter).toLowerCase())
    },
  })

  const hasSelectionColumn = enableRowSelection

  return (
    <div className="w-full max-w-full space-y-4 bg-background border border-border rounded-lg shadow-sm py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4">
        <div className="flex w-full items-center gap-3">
          <div className="flex w-full max-w-xs items-center gap-2">
            <Input
              value={globalFilter ?? ""}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              placeholder={placeholder}
              className="h-9 dar"
            />
          </div>
          {toolbar && (
            <div className="flex items-center gap-3">
              {toolbar(table)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
       
          {actionButton && (
            actionButton.component || (
              <Button size="sm" className="h-9 bg-blue-600 cursor-pointer hover:bg-blue-700 dark:text-white" onClick={actionButton.onClick}>
                <Plus className="mr-2 size-4 dark:text-white" /> {actionButton.label}
              </Button>
            )
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-0 mb-0">
        <Table className="w-full min-w-max ">
          <TableHeader className="bg-muted/30 ">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className="text-slate-600 font-medium text-sm  whitespace-nowrap"
                    style={{ minWidth: header.getSize() ?? 120 }}
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
                    <TableCell key={cellIndex} className="py-0.5" style={{ minWidth: header.getSize() ?? 120 }}>
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
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <TableCell key={cell.id} className="py-0.5 text-sm text-foreground" style={{ minWidth: cell.column.getSize?.() ?? 120 }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnsWithSelection.length}
                  className="h-24 w-full text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2 w-full">
                    <CircleAlert className="mx-auto mb-1 text-muted-foreground size-8" aria-hidden="true" />
                    <span>Sem resultados.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 pt-4 border-t border-border">
        <div className="text-muted-foreground hidden flex-1 text-sm sm:flex">
          {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
        </div>
        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <Button
            variant="outline"
            className="h-8 px-3 cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          {Array.from({ length: table.getPageCount() }, (_, index) => index).map((pageIndex) => {
            const isActive = table.getState().pagination.pageIndex === pageIndex
            return (
              <Button
                key={pageIndex}
                variant={isActive ? "default" : "outline"}
                className="h-8 w-8 p-0 bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                onClick={() => table.setPageIndex(pageIndex)}
                aria-current={isActive ? "page" : undefined}
              >
                {pageIndex + 1}
              </Button>
            )
          })}
          <Button
            variant="outline"
            className="h-8 px-3 cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}

export function createSelectionColumn<TData extends RowData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  }
}

export function createActionsColumn<TData extends RowData>(actions: ActionButton<TData>[]): ColumnDef<TData> {
  return {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {actions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => action.onClick(row.original)}
              className="cursor-pointer"
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 60,
  }
}


