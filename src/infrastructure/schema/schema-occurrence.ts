import { z } from 'zod'

export const occurrenceSchema = z.object({
  id: z.string().optional(),
  cod: z.string().min(1, 'Código é obrigatório'),
  description: z.string().optional(),
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  typeOccorrenceId: z.string().min(1, 'Tipo de ocorrência é obrigatório'),
  equipmentId: z.string().min(1, 'Equipamento é obrigatório'),
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

export interface Occurrence extends z.infer<typeof occurrenceSchema> {}
export interface CreateOccurrence extends z.infer<typeof createOccurrenceSchema> {}
export interface UpdateOccurrence extends z.infer<typeof updateOccurrenceSchema> {}





