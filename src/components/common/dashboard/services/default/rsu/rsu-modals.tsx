"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RsuForm } from "./rsu-form"
import { 
  useCreateRsuMutation, 
  useUpdateRsuMutation 
} from "@/infrastructure/hooks/useRsu"
import type { Rsu, CreateRsu, UpdateRsu } from "@/infrastructure/schema/schema-rsu"

interface CreateRsuModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRsuModal({ 
  isOpen, 
  onOpenChange 
}: CreateRsuModalProps) {
  const createMutation = useCreateRsuMutation()

  const handleSubmit = (data: CreateRsu | UpdateRsu) => {
    createMutation.mutate(data as CreateRsu, {
      onSuccess: () => {
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo RSU</DialogTitle>
          <DialogDescription>
            Crie um novo RSU preenchendo os campos abaixo
          </DialogDescription>
        </DialogHeader>
        
        <RsuForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

interface EditRsuModalProps {
  rsu: Rsu
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRsuModal({ 
  rsu, 
  isOpen, 
  onOpenChange 
}: EditRsuModalProps) {
  const updateMutation = useUpdateRsuMutation()

  const handleSubmit = (data: CreateRsu | UpdateRsu) => {
    updateMutation.mutate(
      { id: rsu.id!, data: data as UpdateRsu },
      {
        onSuccess: () => {
          onOpenChange(false)
        }
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar RSU</DialogTitle>
          <DialogDescription>
            Atualize as informações do RSU {rsu.cod}
          </DialogDescription>
        </DialogHeader>
        
        <RsuForm
          rsu={rsu}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
