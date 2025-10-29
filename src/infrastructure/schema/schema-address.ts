import { z } from "zod";

export interface Address {
  id?: string;
  houseHold: string;
  commune: string;
  municipality: string;
  province: string;
  country: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const addressSchema = z.object({
  id: z.string().uuid().optional(),
  houseHold: z.string().min(1, "Endereço é obrigatório"),
  commune: z.string().min(1, "Comuna é obrigatória"),
  municipality: z.string().min(1, "Município é obrigatório"),
  province: z.string().min(1, "Província é obrigatória"),
  country: z.string().min(1, "País é obrigatório"),
  companyId: z.string().uuid().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const addressesSchema = z.array(addressSchema);

export interface AddressEntity extends z.infer<typeof addressSchema> {}



