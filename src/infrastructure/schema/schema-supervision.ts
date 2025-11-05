import { z } from 'zod';

export const supervisionSchema = z.object({
  id: z.string().optional(),
  cod: z.string().min(1, 'Código é obrigatório'),
  observation: z.string().optional(),
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  desiredNumberWorkers: z.number().min(0, 'Número desejado de trabalhadores não pode ser negativo'),
  numberWorkerPresent: z.number().min(0, 'Número presente não pode ser negativo'),
  equipmentId: z.string().min(1, 'Equipamento é obrigatório'),
  employeeId: z.string().min(1, 'Funcionário é obrigatório'),
  siteId: z.string().min(1, 'Site é obrigatório'),
  time: z.string().min(1, 'Horário é obrigatório'),
  departmentId: z.string().min(1, "Departamento é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
