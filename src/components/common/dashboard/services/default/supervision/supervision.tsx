"use client"

import * as React from "react"
import { SupervisionTable } from "./supervision-table"
import { useSupervisionsQuery } from "@/infrastructure/hooks/useSupervisions"

export default function Supervision() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const { data: supervisions = [], isLoading } = useSupervisionsQuery()

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
      />

     
    </div>
  )
}