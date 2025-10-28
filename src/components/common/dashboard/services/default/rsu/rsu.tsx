"use client"

import * as React from "react"
import { RsuTable } from "./rsu-table"
import { CreateRsuModal } from "./rsu-modals"
import { useRsuQuery } from "@/infrastructure/hooks/useRsu"

export default function Rsu() {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const { data: rsuData, isLoading, error } = useRsuQuery()

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">RSU</h1>
        <p className="text-muted-foreground">
          Gerencie os dados de Resíduos Sólidos Urbanos
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
          <p>Erro ao carregar dados RSU: {error.message}</p>
        </div>
      )}

      <RsuTable
        data={rsuData || []}
        isLoading={isLoading}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <CreateRsuModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  )
}
