import { z } from "zod";

export const createEmployeeSchema = z.object({
  companyId: z.string(),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  photo: z.string().optional(),
  contactId: z.string().min(1, "Contato é obrigatório"),
  siteId: z.string().min(1, "Site é obrigatório"),
  departmentId: z.string().min(1, "Departamento é obrigatório"),
  userId: z.string(),
  cod: z.string(),
  addressId: z.string()
});
