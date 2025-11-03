"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FunnelPlus, LayoutGrid, List, Plus, X } from "lucide-react";
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
import Badge from "@/components/ui/badge";

interface ToolbarProps<TData extends RowData> {
  table: ReactTable<TData>;
  placeholder: string;
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
  actionButton?: {
    label: string;
    onClick?: () => void;
    component?: React.ReactNode;
  };
  toolbar?: (table: ReactTable<TData>) => React.ReactNode;
  view: "table" | "cards";
  onChangeView: (v: "table" | "cards") => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (v: boolean) => void;
  tempDateRange?: DateRange;
  setTempDateRange: (r?: DateRange) => void;
  onApplyDateRange: () => void;
  onClearDateRange: () => void;
}

export function Toolbar<TData extends RowData>({
  table,
  placeholder,
  globalFilter,
  setGlobalFilter,
  actionButton,
  toolbar,
  view,
  onChangeView,
  isFilterOpen,
  setIsFilterOpen,
  tempDateRange,
  setTempDateRange,
  onApplyDateRange,
  onClearDateRange,
}: ToolbarProps<TData>) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ">
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
      </div>

      <div className="flex items-center gap-2  w-full justify-end">
        <div className="text-sm text-muted-foreground flex items-center border-r border-gray-400 dark:border-gray-800 pr-2">
          <Badge variant="outline" className="border-none text-base">
            Total: {table.getRowModel().rows.length} item
          </Badge>
        </div>
        <Tabs value={view} onValueChange={(v) => onChangeView(v as any)}>
          <TabsList className="h-11 max-w-lg w-full">
            <TabsTrigger value="table" className="gap-2 cursor-pointer">
              <List className="size-4" />
              <span className="sr-only">Tabela</span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-2 cursor-pointer">
              <LayoutGrid className="size-4" />
              <span className="sr-only">Cards</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Drawer
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          direction="right"
        >
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              className="h-11 bg-gray-100 dark:bg-gray-900 cursor-pointer"
              aria-label="Filtrar"
            >
              <FunnelPlus className=" size-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-w-2xl w-full">
            <DrawerHeader className="text-center">
              <div className="flex items-center justify-between">
                <DrawerTitle>Filtrar por data</DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" className="ml-auto cursor-pointer">
                    <X className="size-4" />
                  </Button>
                </DrawerClose>
              </div>
              <DrawerDescription>
                {tempDateRange?.from && tempDateRange?.to
                  ? `${new Date(
                      tempDateRange.from
                    ).toLocaleDateString()} — ${new Date(
                      tempDateRange.to
                    ).toLocaleDateString()}`
                  : "Selecione o intervalo"}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4 flex justify-center">
              <Calendar
                mode="range"
                defaultMonth={tempDateRange?.from}
                selected={tempDateRange}
                onSelect={setTempDateRange}
                numberOfMonths={2}
                className="rounded-lg border shadow-sm"
              />
            </div>
            <DrawerFooter>
              <div className="flex items-center gap-2">
                <Button className="cursor-pointer" onClick={onApplyDateRange}>
                  Aplicar
                </Button>
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={onClearDateRange}
                >
                  Limpar
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {actionButton &&
          (actionButton.component || (
            <Button
              size="sm"
              className="h-11 bg-blue-600 cursor-pointer text-base hover:bg-blue-700 dark:text-white"
              onClick={actionButton.onClick}
            >
              <Plus className="mr-2 size-4 dark:text-white" />{" "}
              {actionButton.label}
            </Button>
          ))}
      </div>
    </div>
  );
}
