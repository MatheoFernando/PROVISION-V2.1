"use client";

import * as React from "react";
import { SupervisionTable } from "./supervision-table";
import {
  useSupervisionsQuery,
  useSupervisionsByDayQuery,
  useSupervisionsByStatusQuery,
} from "@/infrastructure/hooks/useSupervisions";
import type { DateRange } from "react-day-picker";

export default function Supervision() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const [status, setStatus] = React.useState<string | undefined>(undefined);

  const { data: all = [], isLoading: loadingAll } = useSupervisionsQuery();

  const singleDay = React.useMemo(() => {
    if (!range?.from || !range.to) return undefined;
    const from = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate());
    const to = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate());
    return from.getTime() === to.getTime() ? from : undefined;
  }, [range]);

  const { data: byDay = [], isLoading: loadingByDay } = useSupervisionsByDayQuery(singleDay);
  const { data: byStatus = [], isLoading: loadingByStatus } = useSupervisionsByStatusQuery(status);

  const supervisions = status
    ? byStatus
    : singleDay
      ? byDay
      : all;

  const isLoading = status
    ? loadingByStatus
    : singleDay
      ? loadingByDay
      : loadingAll;

  return (
    <SupervisionTable
      data={supervisions ?? []}
      isLoading={isLoading}
      onCreateClick={() => setIsCreateOpen(true)}
      onDateRangeChange={setRange}
      statusFilter={status}
      onStatusFilterChange={setStatus}
    />
  );
}
