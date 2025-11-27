"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import { RsuTable } from "./rsu-table";
import {
  useRsuByDateQuery,
  useRsuQuery,
} from "@/infrastructure/hooks/useRsu";
import type { Rsu } from "@/infrastructure/types/domain";

export function Rsu() {
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);

  const { data: allRsu = [], isLoading: loadingAll } = useRsuQuery();

  const singleDay = React.useMemo(() => {
    if (!range?.from || !range.to) return undefined;
    const from = new Date(
      range.from.getFullYear(),
      range.from.getMonth(),
      range.from.getDate()
    );
    const to = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate());
    return from.getTime() === to.getTime() ? from : undefined;
  }, [range]);

  const { data: rsuByDate = [], isLoading: loadingByDate } = useRsuByDateQuery(singleDay);

  const baseData = singleDay ? rsuByDate : allRsu;


  const data = React.useMemo(() => {
    let current: Rsu[] = baseData ?? [];


    return current;
  }, [
    baseData,
    singleDay,
    rsuByDate,
  ]);

  const computedLoading = React.useMemo(() => {

    if (singleDay) return loadingByDate;
    return loadingAll;
  }, [
    singleDay,
    loadingByDate,
    loadingAll,
  ]);

  return (
    <RsuTable
      data={data ?? []}
      isLoading={computedLoading}
      onDateRangeChange={setRange}
    />
  );
}

