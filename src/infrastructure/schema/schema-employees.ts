import { z } from "zod";

export const createEmployeeSchema = z.object({
  companyId: z.string(),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  photo: z.string().optional(),
  contactId: z.string().optional(),
  siteId: z.string().optional(),
  departmentId: z.string().min(1, "Departamento é obrigatório"),
  cod: z.string().min(1, "Código é obrigatório"),
  addressId: z.string().optional(),
  function: z.string().min(1, "Função é obrigatória"),
  roleId: z.string().optional(),
});

const grossContactSchema = z.object({
  companyId: z.string().optional(),
  email: z.string().optional(),
  phoneNumbers: z
    .array(
      z.object({
        phone: z.string().min(1, "Telefone é obrigatório"),
      }),
    )
    .optional(),
}).optional();

const grossAddressSchema = z.object({
  houseHold: z.string().min(1, "Morada é obrigatória"),
  commune: z.string().min(1, "Comuna é obrigatória"),
  municipality: z.string().min(1, "Município é obrigatório"),
  province: z.string().min(1, "Província é obrigatória"),
  country: z.string().min(1, "País é obrigatório"),
}).optional();

export const createGrossEmployeeSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  photo: z.string().optional().default(""),
  function: z.string().min(1, "Função é obrigatória"),
  contact: grossContactSchema,
  address: grossAddressSchema,
  nameSite: z.string().optional().default(""),
  userId: z.string().optional(),
  nameDepartment: z.string().optional().default(""),
});

export type CreateGrossEmployeePayload = z.infer<typeof createGrossEmployeeSchema>;
