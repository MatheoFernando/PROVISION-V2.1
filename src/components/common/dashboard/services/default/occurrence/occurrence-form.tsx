"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
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
import { createOccurrenceSchema } from "@/infrastructure/schema/schema-occurrence"
import type { Occurrence, CreateOccurrence, UpdateOccurrence } from "@/infrastructure/schema/schema-occurrence"
import { useTypeOccurrences } from "@/infrastructure/hooks/useTypeOccurrences"
import { CreateTypeOccurrenceModal } from "./type-occurrence-modal"

// Dados mock para seleções
const mockCompanies = [
  { id: '1', name: 'TechCorp Solutions' },
  { id: '2', name: 'InnovaTech' },
  { id: '3', name: 'DataFlow Systems' },
]

const mockEmployees = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Pedro Costa' },
]

const mockEquipments = [
  { id: '1', name: 'Equipamento A' },
  { id: '2', name: 'Equipamento B' },
  { id: '3', name: 'Equipamento C' },
]

const mockSites = [
  { id: '1', name: 'Site Central' },
  { id: '2', name: 'Site Norte' },
  { id: '3', name: 'Site Sul' },
]

interface OccurrenceFormProps {
  occurrence?: Occurrence
  onSubmit: (data: CreateOccurrence) => void
  onCancel: () => void
  isLoading: boolean
}

export function OccurrenceForm({ 
  occurrence, 
  onSubmit, 
  onCancel, 
  isLoading 
}: OccurrenceFormProps) {
  const [isCreateTypeOccurrenceOpen, setIsCreateTypeOccurrenceOpen] = React.useState(false)
  const { data: typeOccurrences } = useTypeOccurrences()

  const form = useForm<CreateOccurrence>({
    resolver: zodResolver(createOccurrenceSchema),
    defaultValues: occurrence ? {
      cod: occurrence.cod,
      description: occurrence.description,
      companyId: occurrence.companyId,
      typeOccurrenceId: occurrence.typeOccurrenceId,
      equipmentId: occurrence.equipmentId,
      employeeId: occurrence.employeeId,
      siteId: occurrence.siteId,
      time: occurrence.time,
      correctiveAction: occurrence.correctiveAction,
      gravity: occurrence.gravity,
      status: occurrence.status,
    } : {
      cod: '',
      description: '',
      companyId: '',
      typeOccurrenceId: '',
      equipmentId: '',
      employeeId: '',
      siteId: '',
      time: '',
      correctiveAction: '',
      gravity: 'Baixa',
      status: 'Aberto',
    },
  })

  const handleSubmit = (data: CreateOccurrence) => {
    onSubmit(data)
  }

  const handleTypeOccurrenceCreated = (newTypeOccurrence: { id: string; cod: string; description: string }) => {
    form.setValue('typeOccurrenceId', newTypeOccurrence.id)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: OCC001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="typeOccurrenceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Ocorrência</FormLabel>
                <div className="flex gap-2">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typeOccurrences?.map((type) => (
                        <SelectItem key={type.id} value={type.id!}>
                          {type.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsCreateTypeOccurrenceOpen(true)}
                    className="shrink-0"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="equipmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o equipamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockEquipments.map((equipment) => (
                      <SelectItem key={equipment.id} value={equipment.id}>
                        {equipment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funcionário</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="siteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o site" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockSites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gravity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gravidade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a gravidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Aberto">Aberto</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Fechado">Fechado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a ocorrência..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="correctiveAction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ação Corretiva</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a ação corretiva..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : occurrence ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>

      <CreateTypeOccurrenceModal
        isOpen={isCreateTypeOccurrenceOpen}
        onOpenChange={setIsCreateTypeOccurrenceOpen}
        onSuccess={handleTypeOccurrenceCreated}
      />
    </Form>
  );
}
