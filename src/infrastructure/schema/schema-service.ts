import { z } from 'zod';

export const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome do serviço é obrigatório'),
  description: z.string().optional(),
  status: z.boolean(),
  companyId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Nome do serviço é obrigatório'),
  description: z.string().optional(),
  status: z.boolean(),
  companyId: z.string().optional(),
});

export const updateServiceSchema = serviceSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export interface Service extends z.infer<typeof serviceSchema> {}
export interface CreateService extends z.infer<typeof createServiceSchema> {}
export interface UpdateService extends z.infer<typeof updateServiceSchema> {}

export const defaultServices = [
  {
    name: 'Supervisão',
    description: 'Serviço de supervisão e monitoramento',
    url: "/dashboard/service/supervision",
    status: true,
  },
  {
    name: 'Ocorrência',
    description: 'Gestão de ocorrências e incidentes',
       url: "/dashboard/service/occurrence" , 
    status: true,
  },
  {
    name: 'RSU',
    description: 'Recolha Seletiva de Resíduos',
       url: "/dashboard/service/rsu",
    status: true,
  },
] as const;
