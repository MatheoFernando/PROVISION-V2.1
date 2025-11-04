import { z } from "zod";

export const createEmployeeSchema = z.object({
  companyId: z.string(),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  photo: z.string().optional(),
  contactId: z.string().min(1, "Contato é obrigatório"),
  siteId: z.string().optional(),
  departmentId: z.string().min(1, "Departamento é obrigatório"),
  cod: z.string().min(1, "Código é obrigatório"),
  addressId: z.string().min(1, "Endereço é obrigatório"),
  function: z.string().min(1, "Função é obrigatória"),
});
