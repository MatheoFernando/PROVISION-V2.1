"use client"

import * as React from "react"
import { useOccurrences } from "@/infrastructure/hooks/useOccurrences"
import { OccurrenceTable } from "./occurrence-table"

export default function Occurrence() {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const { data: occurrences, isLoading } = useOccurrences()

  return (

    <OccurrenceTable
      data={(occurrences as any) ?? []}
      isLoading={isLoading}
      onCreateClick={() => setIsCreateModalOpen(true)}
    />



  )
}
