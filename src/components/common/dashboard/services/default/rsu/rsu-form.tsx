"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { createRsuSchema } from "@/infrastructure/schema/schema-rsu"
import type { Rsu, CreateRsu, UpdateRsu } from "@/infrastructure/schema/schema-rsu"
import { mockContainers, mockSites, mockEmployees, mockCompanies } from "@/infrastructure/schema/schema-rsu"

interface RsuFormProps {
  rsu?: Rsu
  onSubmit: (data: CreateRsu | UpdateRsu) => void
  onCancel: () => void
  isLoading: boolean
}

export function RsuForm({ 
  rsu, 
  onSubmit, 
  onCancel, 
  isLoading 
}: RsuFormProps) {
  const form = useForm<CreateRsu>({
    resolver: zodResolver(createRsuSchema),
    defaultValues: rsu ? {
      cod: rsu.cod,
      containerId: rsu.containerId,
      companyId: rsu.companyId,
      quantity: rsu.quantity,
      comment: rsu.comment || '',
      employeeId: rsu.employeeId,
      clientTime: rsu.clientTime,
      totalTime: rsu.totalTime,
      siteId: rsu.siteId,
      cardId: rsu.cardId,
    } : {
      cod: '',
      containerId: '',
      companyId: '',
      quantity: 1,
      comment: '',
      employeeId: '',
      clientTime: '',
      totalTime: '',
      siteId: '',
      cardId: '',
    },
  })

  const handleSubmit = (data: CreateRsu | UpdateRsu) => {
    onSubmit(data)
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
                  <Input placeholder="Ex: RSU001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cardId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identificador de Cartão</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: CARD001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="containerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contêiner</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o contêiner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockContainers.map((container) => (
                      <SelectItem key={container.id} value={container.id}>
                        {container.name}
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário do Cliente</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempo Total</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentário</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Digite um comentário..." 
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
            {isLoading ? 'Salvando...' : rsu ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
