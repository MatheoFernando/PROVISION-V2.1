"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { Plus, X } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createTypeOccurrenceSchema } from "@/infrastructure/schema/schema-type-occurrence"
import { useCreateTypeOccurrenceMutation } from "@/infrastructure/hooks/useTypeOccurrences"
import type { CreateTypeOccurrence } from "@/infrastructure/schema/schema-type-occurrence"
import { useCompaniesQuery } from "@/infrastructure/hooks/useCompanies"

interface CreateTypeOccurrenceModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (typeOccurrence: { id: string; cod: string; description: string }) => void
}

export function CreateTypeOccurrenceModal({ 
  isOpen, 
  onOpenChange,
  onSuccess 
}: CreateTypeOccurrenceModalProps) {
  const createMutation = useCreateTypeOccurrenceMutation()
  const { data: companies } = useCompaniesQuery()

  const form = useForm<CreateTypeOccurrence>({
    resolver: zodResolver(createTypeOccurrenceSchema),
    defaultValues: {
      cod: '',
      description: '',
      companyId: '',
      companiesId: '',
    },
  })

  const handleSubmit = (data: CreateTypeOccurrence) => {
    createMutation.mutate(data, {
      onSuccess: (createdTypeOccurrence) => {
        if (createdTypeOccurrence.id) {
          onSuccess?.({
            id: createdTypeOccurrence.id,
            cod: createdTypeOccurrence.cod,
            description: createdTypeOccurrence.description,
          })
        }
        form.reset()
        onOpenChange(false)
      },
      onError: () => {
        // Mantém o modal aberto em caso de erro
      },
    })
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        form.reset()
      }
      onOpenChange(open)
    }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-[60] grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200"
          )}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Novo Tipo de Ocorrência</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo tipo de ocorrência.
            </DialogDescription>
          </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
           
              <FormField
                control={form.control}
                name="cod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: TOC001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o tipo de ocorrência..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Salvando...' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <DialogPrimitive.Close
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  )
}
