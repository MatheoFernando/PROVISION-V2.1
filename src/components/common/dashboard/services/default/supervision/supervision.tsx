"use client";

import * as React from "react";
import { SupervisionTable } from "./supervision-table";
import { useSupervisionsQuery, useSupervisionsByDayQuery } from "@/infrastructure/hooks/useSupervisions";
import type { DateRange } from "react-day-picker";

export default function Supervision() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const { data: all = [], isLoading: loadingAll } = useSupervisionsQuery();
  const singleDay = range?.from && range?.to && (
    new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate()).getTime() ===
    new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate()).getTime()
  ) ? range.from : undefined;
  const { data: byDay = [], isLoading: loadingByDay } = useSupervisionsByDayQuery(singleDay);
  const supervisions = (singleDay ? byDay : all) ?? [];
  const isLoading = singleDay ? loadingByDay : loadingAll;

  return <SupervisionTable
        data={supervisions}
        isLoading={isLoading}
        onCreateClick={() => setIsCreateOpen(true)}
        onDateRangeChange={setRange}
      />

}
