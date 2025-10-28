"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SupervisionForm } from "./supervision-form"
import { 
  useCreateSupervisionMutation, 
  useUpdateSupervisionMutation 
} from "@/infrastructure/hooks/useSupervisions"
import type { Supervision, CreateSupervision, UpdateSupervision } from "@/infrastructure/schema/schema-supervision"

interface CreateSupervisionModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSupervisionModal({ 
  isOpen, 
  onOpenChange 
}: CreateSupervisionModalProps) {
  const createMutation = useCreateSupervisionMutation()

  const handleSubmit = (data: CreateSupervision | UpdateSupervision) => {
    createMutation.mutate(data as CreateSupervision, {
      onSuccess: () => {
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-hidden p-0 gap-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-8 py-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <DialogTitle className="text-2xl font-semibold text-foreground">Nova Supervisão</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Crie uma nova supervisão preenchendo os campos abaixo
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <SupervisionForm
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              isLoading={createMutation.isPending}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface EditSupervisionModalProps {
  supervision: Supervision
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function EditSupervisionModal({ 
  supervision, 
  isOpen, 
  onOpenChange 
}: EditSupervisionModalProps) {
  const updateMutation = useUpdateSupervisionMutation()

  const handleSubmit = (data: CreateSupervision | UpdateSupervision) => {
    updateMutation.mutate(
      { id: supervision.id!, data: data as UpdateSupervision },
      {
        onSuccess: () => {
          onOpenChange(false)
        }
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-hidden p-0 gap-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-8 py-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <DialogTitle className="text-2xl font-semibold text-foreground">Editar Supervisão</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Atualize as informações da supervisão {supervision.cod}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <SupervisionForm
              supervision={supervision}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              isLoading={updateMutation.isPending}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
