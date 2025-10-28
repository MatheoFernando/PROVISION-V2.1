"use client"

import * as React from "react"
import { SupervisionTable } from "./supervision-table"
import { CreateSupervisionModal } from "./supervision-modals"
import { useSupervisionsQuery } from "@/infrastructure/hooks/useSupervisions"

export default function Supervision() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const { data: supervisions = [], isLoading, error } = useSupervisionsQuery()

  return (
    <div className=" py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Supervisão</h1>
        <p className="text-muted-foreground">
          Gerencie supervisões e monitoramento de equipes
        </p>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
          <p>Erro ao carregar supervisões: {error.message}</p>
        </div>
      )}

      <SupervisionTable 
        data={supervisions} 
        isLoading={isLoading}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      <CreateSupervisionModal
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}