import { z } from 'zod';

export const typeOccurrenceSchema = z.object({
  id: z.string().optional(),
  cod: z.string().min(1, 'Código é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  companiesId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});


export interface TypeOccurrence extends z.infer<typeof typeOccurrenceSchema> {}
