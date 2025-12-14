"use client"

import * as React from "react"
import {
  useOccurrences,
  useOccurrencesByDate,
  useOccurrencesByStatus
} from "@/infrastructure/hooks/useOccurrences"
import { OccurrenceTable } from "./occurrence-table"
import type { DateRange } from "react-day-picker"

export default function Occurrence() {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [range, setRange] = React.useState<DateRange | undefined>(undefined)
  const [status, setStatus] = React.useState<string | undefined>(undefined)

  
  const { data: all = [], isLoading: loadingAll } = useOccurrences()

  const singleDay = React.useMemo(() => {
    if (!range?.from || !range.to) return undefined
    const from = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate())
    const to = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate())
    return from.getTime() === to.getTime() ? from.toISOString() : undefined
  }, [range])

  const { data: byDate = [], isLoading: loadingByDate } = useOccurrencesByDate(singleDay ?? "")
  const { data: byStatus = [], isLoading: loadingByStatus } = useOccurrencesByStatus(status ?? "")

  const occurrences = status
    ? byStatus
    : singleDay
      ? byDate
      : all

  const isLoading = status
    ? loadingByStatus
    : singleDay
      ? loadingByDate
      : loadingAll

  return (
    <OccurrenceTable
      data={(occurrences) ?? []}
      isLoading={isLoading}
      onCreateClick={() => setIsCreateModalOpen(true)}
      onDateRangeChange={setRange}
      statusFilter={status}
      onStatusFilterChange={setStatus}
    />
  )
}
