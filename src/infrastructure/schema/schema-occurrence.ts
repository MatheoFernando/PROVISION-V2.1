import { z } from 'zod'
import type { Employee, Equipment, Site, Company, TypeOccorrence } from '@/infrastructure/types/domain'

export const occurrenceSchema = z.object({
  id: z.string().optional(),
  cod: z.string().min(1, 'Código é obrigatório'),
  description: z.string().optional(),
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  typeOccorrenceId: z.string().min(1, 'Tipo de ocorrência é obrigatório'),
  equipmentId: z.string().optional(),
  employeeId: z.string().min(1, 'Funcionário é obrigatório'),
  siteId: z.string().min(1, 'Site é obrigatório'),
  time: z.string().min(1, 'Horário é obrigatório'),
  correctiveAction: z.string().optional(),
  gravity: z.enum(['Baixa', 'Média', 'Alta']).default('Baixa'),
  status: z.enum(['Ativo', 'Inativo', 'Em Andamento', 'Fechado']).default('Ativo'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const createOccurrenceSchema = occurrenceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateOccurrenceSchema = occurrenceSchema
  .partial()
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })

/** Base occurrence type from schema */
export type OccurrenceBase = z.infer<typeof occurrenceSchema>

/** Occurrence with nested relations returned from API */
export interface Occurrence extends OccurrenceBase {
  employees?: Employee | null;
  equipments?: Equipment | null;
  sites?: Site | null;
  companies?: Company | null;
  typeOccorence?: TypeOccorrence | null;
}

export type CreateOccurrence = z.infer<typeof createOccurrenceSchema>
export type UpdateOccurrence = z.infer<typeof updateOccurrenceSchema>






