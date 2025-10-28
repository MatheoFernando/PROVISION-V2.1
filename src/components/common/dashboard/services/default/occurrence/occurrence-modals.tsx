"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { OccurrenceForm } from "./occurrence-form"
import { useCreateOccurrenceMutation, useUpdateOccurrenceMutation } from "@/infrastructure/hooks/useOccurrences"
import type { Occurrence, CreateOccurrence, UpdateOccurrence } from "@/infrastructure/schema/schema-occurrence"

interface CreateOccurrenceModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOccurrenceModal({ isOpen, onOpenChange }: CreateOccurrenceModalProps) {
  const createMutation = useCreateOccurrenceMutation()

  const handleSubmit = (data: CreateOccurrence) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Ocorrência</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova ocorrência.
          </DialogDescription>
        </DialogHeader>
        
        <OccurrenceForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

interface EditOccurrenceModalProps {
  occurrence: Occurrence
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function EditOccurrenceModal({ occurrence, isOpen, onOpenChange }: EditOccurrenceModalProps) {
  const updateMutation = useUpdateOccurrenceMutation()

  const handleSubmit = (data: CreateOccurrence) => {
    updateMutation.mutate(
      { id: occurrence.id!, data: data as UpdateOccurrence },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Ocorrência</DialogTitle>
          <DialogDescription>
            Atualize os dados da ocorrência {occurrence.cod}.
          </DialogDescription>
        </DialogHeader>
        
        <OccurrenceForm
          occurrence={occurrence}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
