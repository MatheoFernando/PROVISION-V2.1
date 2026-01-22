import { z } from "zod";

const rawCommuneSchema = z
  .object({
    nome: z.string().min(1),
    slug: z.string().nullable().optional(),
  })
  .catchall(z.unknown())
  .transform((commune) => ({
    name: commune.nome,
    slug: commune.slug ?? "",
  }));

const rawDistrictSchema = z
  .object({
    nome: z.string().min(1),
    slug: z.string().nullable().optional(),
  })
  .catchall(z.unknown())
  .transform((district) => ({
    name: district.nome,
    slug: district.slug ?? "",
  }));

const rawMunicipalitySchema = z
  .object({
    nome: z.string().min(1),
    slug: z.string().nullable().optional(),
    distritos: z.array(rawDistrictSchema).nullable().optional(),
    comunas: z.array(rawCommuneSchema).nullable().optional(),
  })
  .catchall(z.unknown())
  .transform((municipality) => ({
    name: municipality.nome,
    slug: municipality.slug ?? "",
    districts: municipality.distritos ?? [],
    communes: municipality.comunas ?? [],
  }));

const rawCapitalSchema = z
  .object({
    nome: z.string().min(1),
    slug: z.string().nullable().optional(),
  })
  .catchall(z.unknown())
  .transform((capital) => ({
    name: capital.nome,
    slug: capital.slug ?? "",
  }));

export const angolaProvinceSchema = z
  .object({
    nome: z.string().min(1),
    slug: z.string().nullable().optional(),
    extensao: z.string().nullable().optional(),
    data_fundacao: z.string().nullable().optional(),
    capital: rawCapitalSchema.nullable().optional(),
    municipios: z.array(rawMunicipalitySchema).nullable().optional(),
  })
  .catchall(z.unknown())
  .transform((province) => ({
    name: province.nome,
    slug: province.slug ?? "",
    area: province.extensao ?? "",
    foundationDate: province.data_fundacao ?? "",
    capital: province.capital ?? { name: "", slug: "" },
    municipalities: province.municipios ?? [],
  }));

export const angolaProvinceResponseSchema = z
  .object({
    data: z.array(angolaProvinceSchema),
  })
  .catchall(z.unknown())
  .transform((response) => response.data);

export const angolaCountrySchema = z
  .object({
    nome: z.string().min(1),
    slug: z.string().nullable().optional(),
  })
  .catchall(z.unknown())
  .transform((country) => ({
    name: country.nome,
    slug: country.slug ?? "",
  }));

export const angolaCountryResponseSchema = z
  .object({
    data: angolaCountrySchema,
  })
  .catchall(z.unknown())
  .transform((response) => response.data);

export type AngolaCommune = z.infer<typeof rawCommuneSchema>;
export type AngolaDistrict = z.infer<typeof rawDistrictSchema>;
export type AngolaMunicipality = z.infer<typeof rawMunicipalitySchema>;
export type AngolaProvince = z.infer<typeof angolaProvinceSchema>;
export type AngolaCountry = z.infer<typeof angolaCountrySchema>;

