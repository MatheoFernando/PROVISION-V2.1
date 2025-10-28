import { z } from "zod";

export const customerSchema = z.object({
  id: z.string(),
  cod: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  taxName: z.string().min(1, "Nome fiscal é obrigatório"),
  contactId: z.string(),
  addressId: z.string(),
  nif: z.string().min(9, "NIF deve ter pelo menos 9 caracteres"),
  companyId: z.string(),
  status: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  photo: z.string().optional(),
});

export const createCustomerSchema = customerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type Customer = z.infer<typeof customerSchema>;
export type CreateCustomer = z.infer<typeof createCustomerSchema>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;

export const mockCustomers: Customer[] = [
  {
    id: '1',
    cod: '1234567890',
    name: 'João da Silva',
    taxName: 'João da Silva',
    contactId: '1',
    addressId: '1',
    nif: '1234567890',
    companyId: '1',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    photo: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    cod: '0987654321',
    name: 'Maria da Silva',
    taxName: 'Maria da Silva',
    contactId: '2',
    addressId: '2',
    nif: '0987654321',
    companyId: '2',
    status: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    photo: 'https://via.placeholder.com/150',
  },
];
