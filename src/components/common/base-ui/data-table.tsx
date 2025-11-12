"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  type RowData,
  useReactTable,
  type Table as ReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Toolbar } from "./data-table/toolbar";
import { TableView } from "./data-table/table-view";
import { DeleteModal } from "@/components/ui/delete-modal";

interface ActionButton<TData> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: TData) => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

interface DataTableProps<TData extends RowData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  searchKey?: keyof TData & string;
  placeholder?: string;
  enableRowSelection?: boolean;
  actionButton?: {
    label: string;
    onClick?: () => void;
    component?: React.ReactNode;
  };
  rowActions?: ActionButton<TData>[];
  toolbar?: (table: ReactTable<TData>) => React.ReactNode;
  includeSelection?: boolean;
  isLoading?: boolean;
  dateKey?: keyof TData & string;
  onDateRangeChange?: (range?: DateRange) => void;
  onBulkDelete?: (selected: TData[]) => void;
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
  onDateRangeChange,
  onBulkDelete,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});

  const hasDateColumn = React.useMemo(() => {
    if (!dateKey) return false;
    return (columns as any[]).some((col: any) => {
      const accessorId = (col.id ?? col.accessorKey) as string | undefined;
      return accessorId === (dateKey as unknown as string);
    });
  }, [columns, dateKey]);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => {
      if (dateKey && !hasDateColumn) {
        return { [dateKey]: false } as unknown as VisibilityState;
      }
      return {};
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 15,
  });
  const [viewAsCard, setViewAsCard] = React.useState(false);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<
    DateRange | undefined
  >(undefined);
  const [tempSelectedRange, setTempSelectedRange] = React.useState<
    DateRange | undefined
  >(undefined);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false);

  const dataWithDateFilter = React.useMemo(() => {
    if (!selectedRange || !selectedRange.from || !selectedRange.to || !dateKey)
      return data;
    const toDateOnly = (dt: Date) =>
      new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const from = toDateOnly(new Date(selectedRange.from));
    const to = toDateOnly(new Date(selectedRange.to));
    return data.filter((row: any) => {
      const value = (row as any)[dateKey as unknown as string];
      if (!value) return false;
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return false;
      const dOnly = toDateOnly(d);
      return dOnly >= from && dOnly <= to;
    });
  }, [data, selectedRange, dateKey]);

  const columnsWithSelection = React.useMemo<ColumnDef<TData, any>[]>(() => {
    let finalColumns = columns.map((col: any) => {
      const accessorId = (col.id ?? col.accessorKey) as string | undefined;
      if (dateKey && accessorId === (dateKey as unknown as string)) {
        return { enableSorting: true, sortingFn: "datetime", ...col };
      }
      if (searchKey && accessorId === (searchKey as unknown as string)) {
        return { enableSorting: true, sortingFn: "alphanumeric", ...col };
      }
      return col;
    });

    if (dateKey && !hasDateColumn) {
      finalColumns = [
        ...finalColumns,
        {
          id: dateKey as unknown as string,
          accessorKey: dateKey as unknown as string,
          header: "",
          enableSorting: true,
          sortingFn: "datetime",
        } as unknown as ColumnDef<TData, any>,
      ];
    }

    if (includeSelection) {
      finalColumns = [createSelectionColumn<TData>(), ...finalColumns];
    }

    if (rowActions && rowActions.length > 0) {
      finalColumns = [...finalColumns, createActionsColumn<TData>(rowActions)];
    }

    return finalColumns;
  }, [columns, includeSelection, rowActions, dateKey, hasDateColumn, searchKey]);

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
      const needle = String(filter).trim().toLowerCase();
      if (!needle) return true;
      const cells = (row.getAllCells?.() ?? row.getVisibleCells?.() ?? []) as any[];
      if (cells.length > 0) {
        return cells.some((cell: any) => {
          const colId = String(cell.column?.id ?? "");
          if (colId === "select" || colId === "actions") return false;
          const raw = row.getValue?.(colId as any);
          return String(raw ?? "").toLowerCase().includes(needle);
        });
      }
      const values = Object.values(row.original as Record<string, unknown>);
      return values.some((v) => String(v ?? "").toLowerCase().includes(needle));
    },
  });

  const selectedRows = table.getSelectedRowModel().rows ?? [];
  const totalRows = table.getRowModel().rows.length;
  const selectedCount = selectedRows.length;
  const isAllSelected = selectedCount > 0 && selectedCount === totalRows;

  return (
    <div className="w-full max-w-full space-y-4 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
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
        tempRange={tempSelectedRange}
        setTempRange={(r) => {
          const normalized =
            r && r.from ? { from: r.from, to: r.to ?? r.from } : undefined;
          setTempSelectedRange(normalized);
          setSelectedRange(normalized);
          onDateRangeChange?.(normalized);
        }}
        onClearRange={() => {
          setTempSelectedRange(undefined);
          setSelectedRange(undefined);
        }}
        searchKey={searchKey}
        dateKey={dateKey}
        selectedCount={selectedCount}
        isAllSelected={isAllSelected}
        onClickDeleteSelected={() => {
          if (selectedCount === 0) return;
          setIsBulkDeleteOpen(true);
        }}
      />

      <TableView
        table={table}
        isLoading={isLoading}
        colSpan={columnsWithSelection.length}
      />

    
      {onBulkDelete && (
        <DeleteModal
          isOpen={isBulkDeleteOpen}
          onClose={() => setIsBulkDeleteOpen(false)}
          onConfirm={() => {
            const originals = selectedRows.map((r: any) => r.original as TData);
            onBulkDelete?.(originals);
            setIsBulkDeleteOpen(false);
          }}
          title={isAllSelected ? "Excluir todos" : "Excluir selecionados"}
          message={
            isAllSelected
              ? "Tem certeza que deseja excluir todos os itens selecionados? Esta ação não pode ser desfeita."
              : `Tem certeza que deseja excluir ${selectedCount} item(ns) selecionado(s)? Esta ação não pode ser desfeita.`
          }
          isLoading={false}
        />
      )}

      <div className="flex items-center justify-end px-4 pt-4 border-t border-border">
        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <Button
            variant="ghost"
            className="h-8 px-3 cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          {Array.from(
            { length: table.getPageCount() },
            (_, index) => index
          ).map((pageIndex) => {
            const isActive =
              table.getState().pagination.pageIndex === pageIndex;
            return (
              <Button
                key={pageIndex}
                variant={isActive ? "default" : "outline"}
                className="h-8 w-8 p-0 cursor-pointer"
                onClick={() => table.setPageIndex(pageIndex)}
                aria-current={isActive ? "page" : undefined}
              >
                {pageIndex + 1}
              </Button>
            );
          })}
          <Button
            variant="ghost"
            className="h-8 px-3 cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próximo 
          </Button>
        </div>
      </div>
    </div>
  );
}

export function createSelectionColumn<
  TData extends RowData
>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
    size: 44,
  };
}

export function createActionsColumn<TData extends RowData>(
  actions: ActionButton<TData>[]
): ColumnDef<TData> {
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
    size: 30,
  };
}

