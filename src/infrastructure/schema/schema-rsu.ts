import { z } from 'zod';

export const rsuSchema = z.object({
  id: z.string().optional(),
  cod: z.string().min(1, 'Código é obrigatório'),
  containerId: z.string().min(1, 'Contêiner é obrigatório'),
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  comment: z.string().optional(),
  employeeId: z.string().min(1, 'Funcionário é obrigatório'),
  clientTime: z.string().min(1, 'Horário do cliente é obrigatório'),
  totalTime: z.string().min(1, 'Tempo total é obrigatório'),
  siteId: z.string().min(1, 'Site é obrigatório'),
  cardId: z.string().min(1, 'Identificador de cartão é obrigatório'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createRsuSchema = rsuSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRsuSchema = rsuSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export interface Rsu extends z.infer<typeof rsuSchema> {}
export interface CreateRsu extends z.infer<typeof createRsuSchema> {}
export interface UpdateRsu extends z.infer<typeof updateRsuSchema> {}

export const mockRsu: Rsu[] = [
  {
    id: '1',
    cod: 'RSU001',
    containerId: '1',
    companyId: '1',
    quantity: 150,
    comment: 'Coleta matutina - resíduos orgânicos',
    employeeId: '1',
    clientTime: '08:00',
    totalTime: '08:30',
    siteId: '1',
    cardId: 'CARD001',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    cod: 'RSU002',
    containerId: '2',
    companyId: '2',
    quantity: 200,
    comment: 'Coleta vespertina - resíduos recicláveis',
    employeeId: '2',
    clientTime: '14:00',
    totalTime: '14:45',
    siteId: '2',
    cardId: 'CARD002',
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
  },
  {
    id: '3',
    cod: 'RSU003',
    containerId: '3',
    companyId: '1',
    quantity: 100,
    comment: 'Coleta noturna - resíduos especiais',
    employeeId: '3',
    clientTime: '22:00',
    totalTime: '22:20',
    siteId: '1',
    cardId: 'CARD003',
    createdAt: '2024-01-15T22:00:00Z',
    updatedAt: '2024-01-15T22:00:00Z',
  },
];

export const mockContainers = [
  { id: '1', name: 'Container Orgânico - Setor A' },
  { id: '2', name: 'Container Reciclável - Setor B' },
  { id: '3', name: 'Container Especial - Setor C' },
  { id: '4', name: 'Container Geral - Setor D' },
  { id: '5', name: 'Container Industrial - Setor E' },
];

export const mockSites = [
  { id: '1', name: 'Site Industrial Norte' },
  { id: '2', name: 'Site Industrial Sul' },
  { id: '3', name: 'Site Comercial Centro' },
  { id: '4', name: 'Site Residencial Leste' },
  { id: '5', name: 'Site Residencial Oeste' },
];

export const mockEmployees = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Pedro Oliveira' },
  { id: '4', name: 'Ana Costa' },
  { id: '5', name: 'Carlos Ferreira' },
];

export const mockCompanies = [
  { id: '1', name: 'Empresa ABC Ltda' },
  { id: '2', name: 'Empresa XYZ S.A.' },
  { id: '3', name: 'Empresa 123 Ltda' },
  { id: '4', name: 'Empresa DEF S.A.' },
  { id: '5', name: 'Empresa GHI Ltda' },
];


