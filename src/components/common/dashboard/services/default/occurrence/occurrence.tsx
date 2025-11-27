"use client"

import * as React from "react"
import { OccurrenceTable } from "./occurrence-table"
import { useOccurrences } from "@/infrastructure/hooks/useOccurrences"

export default function Occurrence() {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const { data: occurrences, isLoading } = useOccurrences()

  return (
    <div className="py-6">
      <OccurrenceTable
        data={occurrences}
        isLoading={isLoading}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

    
    </div>
  )
}
