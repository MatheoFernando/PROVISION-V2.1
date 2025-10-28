import { z } from "zod";

export const employeeSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  photo: z.string().optional(),
  contactId: z.string().min(1, "Contato é obrigatório"),
  siteId: z.string().min(1, "Site é obrigatório"),
  status: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  sitesId: z.string(),
  departmentId: z.string().min(1, "Departamento é obrigatório"),
  userId: z.string(),
  cod: z.string(),
  functionEntityId: z.string(),
  rolesEntityId: z.string(),
});

export const createEmployeeSchema = employeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type Employee = z.infer<typeof employeeSchema>;
export type CreateEmployee = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof updateEmployeeSchema>;

export const mockEmployees: Employee[] = [
  {
    id: "1",
    companyId: "1",
    cod: "1234567890",
    fullName: "John Doe",
    photo: "https://via.placeholder.com/150",
    contactId: "1",
    siteId: "1",
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sitesId: "1",
    departmentId: "1",
    userId: "1",
    functionEntityId: "1",
    rolesEntityId: "1",
  },
  {
    id: "2",
    companyId: "2",
    cod: "0987654321",
    fullName: "Jane Doe",
    photo: "https://via.placeholder.com/150",
    contactId: "2",
    siteId: "2",
    status: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    sitesId: "2",
    departmentId: "2",
    userId: "2",
    functionEntityId: "2",
    rolesEntityId: "2",

  },
  {
    id: "3",
    companyId: "3",
    cod: "1234567890",
    fullName: "John Smith",
    photo: "https://via.placeholder.com/150",
    contactId: "3",
    siteId: "3",
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sitesId: "3",
    departmentId: "3",
    userId: "3",
    functionEntityId: "3",
    rolesEntityId: "3",
  },
];
