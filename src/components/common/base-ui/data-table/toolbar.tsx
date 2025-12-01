"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FunnelPlus, Plus, X, ChevronDown, UploadCloud } from "lucide-react";
import { ArrowClockwise } from "phosphor-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import type { RowData, Table as ReactTable } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ToolbarProps<TData extends RowData> {
  table: ReactTable<TData>;
  placeholder: string;
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
  actionButton?: {
    label: string;
    onClick?: () => void;
    component?: React.ReactNode;
  };
  bulkImportButton?: {
    label: string;
    onClick: () => void;
  };
  toolbar?: (table: ReactTable<TData>) => React.ReactNode;
  view: "table" | "cards";
  onChangeView: (v: "table" | "cards") => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (v: boolean) => void;
  tempRange?: DateRange;
  setTempRange: (r?: DateRange) => void;
  onClearRange: () => void;
  searchKey?: string;
  dateKey?: string;
  onRefetch?: () => void;
}

export function Toolbar<TData extends RowData>({
  table,
  placeholder,
  globalFilter,
  actionButton,
  bulkImportButton,
  toolbar,
  isFilterOpen,
  setIsFilterOpen,
  tempRange,
  setTempRange,
  onClearRange,
  searchKey,
  dateKey,
  onRefetch,
}: ToolbarProps<TData>) {
  const queryClient = useQueryClient();
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [sortLabel, setSortLabel] = React.useState("Mais recente");
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const d = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  async function handleRefetch() {
    setIsRefreshing(true);
    try {
      if (onRefetch) {
        await onRefetch();
      } else {
        await queryClient.refetchQueries({ type: "active" });
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }

  function setSortRecent() {
    if (dateKey) table.setSorting([{ id: dateKey, desc: true } as any]);
    setSortLabel("Mais recente");
  }

  function setSortOldest() {
    if (dateKey) table.setSorting([{ id: dateKey, desc: false } as any]);
    setSortLabel("Mais antigo");
  }

  function setSortAZ() {
    if (searchKey) table.setSorting([{ id: searchKey, desc: false } as any]);
    setSortLabel("A–Z");
  }

  function setSortZA() {
    if (searchKey) table.setSorting([{ id: searchKey, desc: true } as any]);
    setSortLabel("Z–A");
  }
 
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between ">
      <div className="flex w-full items-center gap-3">
        <div className="flex w-full max-w-xs items-center gap-2">
          <Input
            value={globalFilter ?? ""}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            placeholder={placeholder}
            className="h-9 "
          />
        </div>
        {toolbar && (
          <div className="flex items-center gap-3">{toolbar(table)}</div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-9 min-w-[180px] cursor-pointer justify-between px-3 font-medium"
            >
              {sortLabel}
              <ChevronDown className="ml-2 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={setSortRecent}
            >
              Mais recente
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={setSortOldest}
            >
              Mais antigo
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={setSortAZ}
              disabled={!searchKey}
            >
              A–Z
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={setSortZA}
              disabled={!searchKey}
            >
              Z–A
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2  w-full justify-end">
          <Button
            variant="ghost"
            className="h-11 cursor-pointer bg-muted/40 hover:bg-muted/60 dark:bg-muted/20 dark:hover:bg-muted/30"
            aria-label="Atualizar dados"
            disabled={isRefreshing}
            onClick={handleRefetch}
          >
            <ArrowClockwise
              className={`size-4 transition-transform duration-500 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </Button>
      
        <Drawer
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          direction="right"
        >
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              className="h-11 cursor-pointer bg-muted/40 hover:bg-muted/60 dark:bg-muted/20 dark:hover:bg-muted/30"
              aria-label="Filtrar"
            >
              <FunnelPlus className=" size-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-w-2xl w-full">
            <DrawerHeader className="text-center">
              <div className="flex items-center justify-between">
                <DrawerTitle>Filtros</DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" className="ml-auto cursor-pointer">
                    <X className="size-4" />
                  </Button>
                </DrawerClose>
              </div>
              <DrawerDescription>
                Escolha os filtros desejados
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm font-medium">Data</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => setShowDatePicker((v) => !v)}
                  aria-label="Abrir seletor de data"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              {showDatePicker && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-4">
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      defaultMonth={tempRange?.from}
                      selected={tempRange?.from}
                      onSelect={(day) => {
                        if (!day) return setTempRange(undefined)
                        const from = d(day)
                        setTempRange({ from, to: from })
                      }}
                      className=" cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        const today = new Date();
                        const yesterday = new Date(today);
                        yesterday.setDate(today.getDate() - 1);
                        const y = d(yesterday);
                        setTempRange({ from: y, to: y });
                      }}
                    >
                      Último dia
                    </Button>
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        const to = d(new Date());
                        const from = d(new Date());
                        from.setDate(from.getDate() - 6);
                        setTempRange({ from, to });
                      }}
                    >
                      Últimos 7 dias
                    </Button>
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        const to = d(new Date());
                        const from = d(new Date());
                        from.setDate(from.getDate() - 29);
                        setTempRange({ from, to });
                      }}
                    >
                      Últimos 30 dias
                    </Button>
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        const now = new Date();
                        const start = d(new Date(now.getFullYear(), now.getMonth() - 1, 1));
                        const end = d(new Date(now.getFullYear(), now.getMonth(), 0));
                        setTempRange({ from: start, to: end });
                      }}
                    >
                      Último mês
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DrawerFooter>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={onClearRange}
                >
                  Limpar
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {bulkImportButton && (
          <Button
            size="sm"
            variant="outline"
            className="h-11 cursor-pointer text-base"
            onClick={bulkImportButton.onClick}
          >
            <UploadCloud className="mr-2 size-4" />
            {bulkImportButton.label}
          </Button>
        )}

        {actionButton &&
          (actionButton.component || (
            <Button
              size="sm"
              variant="default"
              className="h-11 cursor-pointer text-base"
              onClick={actionButton.onClick}
            >
              <Plus className="mr-2 size-4" />
              {actionButton.label}
            </Button>
          ))}
      </div>
    </div>
  );
}
