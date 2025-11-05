"use client"

import * as React from "react"
import { OccurrenceTable } from "./occurrence-table"
import { useOccurrences } from "@/infrastructure/hooks/useOccurrences"

export default function Occurrence() {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const { data: occurrences, isLoading, error } = useOccurrences()

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Ocorrências</h1>
        <p className="text-muted-foreground">
          Gerencie as ocorrências registradas no sistema
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
          <p>Erro ao carregar ocorrências: {error.message}</p>
        </div>
      )}

      <OccurrenceTable
        data={occurrences}
        isLoading={isLoading}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

    
    </div>
  )
}
