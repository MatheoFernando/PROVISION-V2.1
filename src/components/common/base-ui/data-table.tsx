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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import {  MoreHorizontal } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { Toolbar } from "./data-table/toolbar"
import { TableView } from "./data-table/table-view"

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
  dateKey?: keyof TData & string
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
  dateKey,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
  const [viewAsCard, setViewAsCard] = React.useState(false)
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  const [tempDateRange, setTempDateRange] = React.useState<DateRange | undefined>(undefined)

  const dataWithDateFilter = React.useMemo(() => {
    if (!dateRange || !dateRange.from || !dateRange.to) return data
    const from = new Date(dateRange.from)
    const to = new Date(dateRange.to)
    return data.filter((row: any) => {
      const value = (row as any)[(dateKey as unknown as string)]
      if (!value) return false
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return false
      return d >= from && d <= to
    })
  }, [data, dateRange])

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
    data: dataWithDateFilter,
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
      const needle = String(filter).toLowerCase()
      if (!needle) return true
      if (searchKey) {
        const value = row.original?.[searchKey]
        return String(value ?? "").toLowerCase().includes(needle)
      }
      // Sem searchKey: procura em todos os campos do objeto
      const values = Object.values(row.original as Record<string, unknown>)
      return values.some((v) => String(v ?? "").toLowerCase().includes(needle))
    },
  })

  const hasSelectionColumn = enableRowSelection

  return (
    <div className="w-full max-w-full space-y-4 ">
      <Toolbar
        table={table}
        placeholder={placeholder}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        actionButton={actionButton}
        toolbar={toolbar}
        view={viewAsCard ? "cards" : "table"}
        onChangeView={(v) => setViewAsCard(v === "cards")}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        tempDateRange={tempDateRange}
        setTempDateRange={setTempDateRange}
        onApplyDateRange={() => { setDateRange(tempDateRange); setIsFilterOpen(false) }}
        onClearDateRange={() => { setTempDateRange(undefined); setDateRange(undefined) }}
      />

      {!viewAsCard && (
        <TableView table={table} isLoading={isLoading} colSpan={columnsWithSelection.length} />
      )}

  
   

      <div className="flex items-center justify-end px-4 pt-4 border-t border-border">
       
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
    size: 1,
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


