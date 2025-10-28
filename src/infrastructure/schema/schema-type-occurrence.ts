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

export const createTypeOccurrenceSchema = typeOccurrenceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTypeOccurrenceSchema = typeOccurrenceSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export interface TypeOccurrence extends z.infer<typeof typeOccurrenceSchema> {}
export interface CreateTypeOccurrence extends z.infer<typeof createTypeOccurrenceSchema> {}
export interface UpdateTypeOccurrence extends z.infer<typeof updateTypeOccurrenceSchema> {}

export const mockTypeOccurrences: TypeOccurrence[] = [
  {
    id: '1',
    cod: 'TOC001',
    description: 'Falha de Equipamento',
    companyId: '1',
    companiesId: '1',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    cod: 'TOC002',
    description: 'Acidente de Trabalho',
    companyId: '1',
    companiesId: '1',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '3',
    cod: 'TOC003',
    description: 'Problema de TI',
    companyId: '1',
    companiesId: '1',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '4',
    cod: 'TOC004',
    description: 'Falha de Processo',
    companyId: '1',
    companiesId: '1',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '5',
    cod: 'TOC005',
    description: 'Problema de Qualidade',
    companyId: '1',
    companiesId: '1',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
];
