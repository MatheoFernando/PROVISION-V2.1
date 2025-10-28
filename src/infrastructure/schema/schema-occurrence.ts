import { z } from 'zod';

export const occurrenceSchema = z.object({
  id: z.string().optional(),
  cod: z.string().min(1, 'Código é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  typeOccurrenceId: z.string().min(1, 'Tipo de ocorrência é obrigatório'),
  equipmentId: z.string().min(1, 'Equipamento é obrigatório'),
  employeeId: z.string().min(1, 'Funcionário é obrigatório'),
  siteId: z.string().min(1, 'Site é obrigatório'),
  time: z.string().min(1, 'Horário é obrigatório'),
  correctiveAction: z.string().min(1, 'Ação corretiva é obrigatória'),
  gravity: z.enum(['Baixa', 'Média', 'Alta']),
  status: z.enum(['Aberto', 'Em Andamento', 'Fechado']),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createOccurrenceSchema = occurrenceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOccurrenceSchema = occurrenceSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export interface Occurrence extends z.infer<typeof occurrenceSchema> {}
export interface CreateOccurrence extends z.infer<typeof createOccurrenceSchema> {}
export interface UpdateOccurrence extends z.infer<typeof updateOccurrenceSchema> {}

export const mockOccurrences: Occurrence[] = [
  {
    id: '1',
    cod: 'OCC001',
    description: 'Falha no equipamento de produção',
    companyId: '1',
    typeOccurrenceId: '1',
    equipmentId: '1',
    employeeId: '1',
    siteId: '1',
    time: '08:30',
    correctiveAction: 'Manutenção preventiva agendada',
    gravity: 'Alta',
    status: 'Aberto',
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-01-15T08:30:00Z',
  },
  {
    id: '2',
    cod: 'OCC002',
    description: 'Acidente menor no setor de qualidade',
    companyId: '2',
    typeOccurrenceId: '2',
    equipmentId: '2',
    employeeId: '2',
    siteId: '2',
    time: '14:15',
    correctiveAction: 'Treinamento de segurança realizado',
    gravity: 'Média',
    status: 'Fechado',
    createdAt: '2024-01-15T14:15:00Z',
    updatedAt: '2024-01-15T16:00:00Z',
  },
  {
    id: '3',
    cod: 'OCC003',
    description: 'Problema de conectividade na rede',
    companyId: '1',
    typeOccurrenceId: '3',
    equipmentId: '3',
    employeeId: '3',
    siteId: '1',
    time: '10:45',
    correctiveAction: 'Cabo de rede substituído',
    gravity: 'Baixa',
    status: 'Fechado',
    createdAt: '2024-01-15T10:45:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
  },
];




