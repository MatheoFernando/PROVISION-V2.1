"use client"

import * as React from "react"
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { useOccurrences, useOccurrencesByStatus, useOccurrencesByDate } from "@/infrastructure/hooks/useOccurrences"
import { OccurrenceTable } from "./occurrence-table"
import type { DateRange } from "react-day-picker"
import type { Occurrence } from "@/infrastructure/schema/schema-occurrence"

export default function Occurrence() {
  const companyId = useAuthStore((s) => s.companyId || "")
  const [range, setRange] = React.useState<DateRange | undefined>(undefined)
  const [status, setStatus] = React.useState<string | undefined>(undefined)


  
  const isSingleDay = range?.from && (!range.to || range.from.toDateString() === range.to.toDateString())
  const dateParam = isSingleDay && range?.from ? range.from.toISOString() : ""

  const enableByStatus = !!status && !!companyId
  const enableByDate = !status && !!isSingleDay && !!companyId
  const enableAll = !enableByStatus && !enableByDate && !!companyId

  
  const { data: occurrencesByStatus = [], isLoading: loadStatus } = useOccurrencesByStatus(companyId, status || "")
  const { data: occurrencesByDate = [], isLoading: loadDate } = useOccurrencesByDate(companyId, enableByDate ? dateParam : "")

  
  const { data: allOccurrences = [], isLoading: loadAll } = useOccurrences(
     (!enableByStatus && !enableByDate) ? companyId : ""
  )

  const isLoading = enableByStatus ? loadStatus : (enableByDate ? loadDate : loadAll)
  const rawData = enableByStatus ? occurrencesByStatus : (enableByDate ? occurrencesByDate : allOccurrences)

  const filteredOccurrences = React.useMemo((): Occurrence[] => {
    let result = rawData as Occurrence[]
    if (enableByStatus && range?.from) {
       const fromDate = new Date(range.from)
       fromDate.setHours(0, 0, 0, 0)
       
       const toDate = range.to ? new Date(range.to) : new Date(range.from)
       toDate.setHours(23, 59, 59, 999)

       result = result.filter((occ) => {
         const dateStr = occ.createdAt 
         if (!dateStr) return false
         const occDate = new Date(dateStr)
         return occDate >= fromDate && occDate <= toDate
       })
    }

    if (enableAll) {
       if (status) {
         result = result.filter((occ) => occ.status === status)
       }
       if (range?.from) {
          const fromDate = new Date(range.from)
          fromDate.setHours(0, 0, 0, 0)
          
          const toDate = range.to ? new Date(range.to) : new Date(range.from)
          toDate.setHours(23, 59, 59, 999)

          result = result.filter((occ) => {
             const dateStr = occ.createdAt 
             if (!dateStr) return false
             const occDate = new Date(dateStr)
             return occDate >= fromDate && occDate <= toDate
          })
       }
    }

    return result
  }, [rawData, status, range, enableByStatus, enableAll])

  return (
    <OccurrenceTable
      data={filteredOccurrences}
      isLoading={isLoading}
      onDateRangeChange={setRange}
      statusFilter={status}
      onStatusFilterChange={setStatus}
    />
  )
}
