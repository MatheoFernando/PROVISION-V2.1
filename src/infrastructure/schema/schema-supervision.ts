import { z } from 'zod'

const optionalNonNegativeNumber = z
  .preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined
    if (typeof value === 'number') {
      return Number.isNaN(value) ? undefined : value
    }
    if (typeof value === 'string') {
      const parsedValue = Number(value)
      return Number.isNaN(parsedValue) ? undefined : parsedValue
    }
    return value
  }, z.number().min(0, 'Número não pode ser negativo').optional())

export const supervisionSchema = z.object({
  id: z.string().optional(),
  cod: z.string().min(1, 'Código é obrigatório'),
  observation: z.string().min(1, 'Observação é obrigatória'),
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  desiredNumberWorkers: optionalNonNegativeNumber,
  numberWorkerPresent: optionalNonNegativeNumber,
  equipmentId: z.string().optional(),
  employeeId: z.string().min(1, 'Funcionário é obrigatório'),
  siteId: z.string().min(1, 'Site é obrigatório'),
  time: z.string().min(1, 'Horário é obrigatório'),
  departmentId: z.string().min(1, 'Departamento é obrigatório'),
  status: z.string().min(1, 'Estado é obrigatório'),
})
