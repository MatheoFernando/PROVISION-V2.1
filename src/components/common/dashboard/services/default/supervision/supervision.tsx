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

  return (
    <div className=" py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Supervisão</h1>
        <p className="text-muted-foreground">
          Gerencie supervisões e monitoramento de equipes
        </p>
      </div>

      <SupervisionTable
        data={supervisions}
        isLoading={isLoading}
        onCreateClick={() => setIsCreateOpen(true)}
        onDateRangeChange={setRange}
      />
    </div>
  );
}
