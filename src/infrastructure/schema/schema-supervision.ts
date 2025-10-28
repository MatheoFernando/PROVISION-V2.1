import { z } from 'zod';

export const supervisionSchema = z.object({
  id: z.string().optional(),
  cod: z.string().min(1, 'Código é obrigatório'),
  observation: z.string().optional(),
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  desiredNumberWorkers: z.number().min(1, 'Número desejado de trabalhadores deve ser maior que 0'),
  numberWorkerPresent: z.number().min(0, 'Número presente não pode ser negativo'),
  equipmentId: z.string().min(1, 'Equipamento é obrigatório'),
  employeeId: z.string().min(1, 'Funcionário é obrigatório'),
  siteId: z.string().min(1, 'Site é obrigatório'),
  time: z.string().min(1, 'Horário é obrigatório'),
  departmentId: z.string().min(1, 'Departamento é obrigatório'),
  status: z.enum(['Ativo', 'Inativo']),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createSupervisionSchema = supervisionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSupervisionSchema = supervisionSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export interface Supervision extends z.infer<typeof supervisionSchema> {}
export interface CreateSupervision extends z.infer<typeof createSupervisionSchema> {}
export interface UpdateSupervision extends z.infer<typeof updateSupervisionSchema> {}

export const mockSupervisions: Supervision[] = [
  {
    id: '1',
    cod: 'SUP001',
    observation: 'Supervisão de turno matutino',
    companyId: '1',
    desiredNumberWorkers: 10,
    numberWorkerPresent: 8,
    equipmentId: '1',
    employeeId: '1',
    siteId: '1',
    time: '08:00',
    departmentId: '1',
    status: 'Ativo',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    cod: 'SUP002',
    observation: 'Supervisão de turno vespertino',
    companyId: '2',
    desiredNumberWorkers: 12,
    numberWorkerPresent: 11,
    equipmentId: '2',
    employeeId: '2',
    siteId: '2',
    time: '14:00',
    departmentId: '2',
    status: 'Ativo',
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
  },
  {
    id: '3',
    cod: 'SUP003',
    observation: 'Supervisão de turno noturno',
    companyId: '1',
    desiredNumberWorkers: 8,
    numberWorkerPresent: 6,
    equipmentId: '3',
    employeeId: '3',
    siteId: '1',
    time: '22:00',
    departmentId: '1',
    status: 'Inativo',
    createdAt: '2024-01-15T22:00:00Z',
    updatedAt: '2024-01-15T22:00:00Z',
  },
];
