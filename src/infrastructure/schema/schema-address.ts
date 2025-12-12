import { z } from "zod";

export interface Address {
  id?: string;
  houseHold: string;
  commune?: string;
  municipality?: string;
  province?: string;
  country?: string;
  companyId?: string;
}

export const addressSchema = z.object({
  id: z.string().optional(),
  houseHold: z.string().min(1, "Morada é obrigatória"),
  commune: z.string().optional(),
  municipality: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  companyId: z.string().optional(),

});

export const addressesSchema = z.array(addressSchema);

export interface AddressEntity extends z.infer<typeof addressSchema> {}



