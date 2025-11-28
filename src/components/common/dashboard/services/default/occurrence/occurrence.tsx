"use client"

import * as React from "react"
import { useOccurrences } from "@/infrastructure/hooks/useOccurrences"
import { OccurrenceTable } from "./occurrence-table"

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
