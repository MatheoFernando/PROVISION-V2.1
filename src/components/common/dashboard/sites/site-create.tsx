"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createSiteSchema,
  type CreateSite,
} from "@/infrastructure/schema/schema-sites";
import { useCreateSite } from "@/infrastructure/hooks/useSites";
import { useUpdateSite as useUpdateSiteHook } from "@/infrastructure/hooks/useSites";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { SectorSelect } from "@/components/common/base-ui/selects/sector-select";
import { ContactSelect } from "@/components/common/base-ui/selects/contact-select";
import { AddressSelect } from "@/components/common/base-ui/selects/address-select";
import { ZoneSelect } from "@/components/common/base-ui/selects/zone-select";
import { AreaSelect } from "@/components/common/base-ui/selects/area-select";
import { CustomerSelect } from "@/components/common/base-ui/selects/customer-select";

interface SitesCreatePageProps {
  id?: string;
  initialData?: Partial<CreateSite> & { id?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SitesCreatePage(props: SitesCreatePageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const companyId = useAuthStore((state) => state.companyId) || "";
  const createSite = useCreateSite();
  const updateSite = useUpdateSiteHook();

  const form = useForm<CreateSite>({
    resolver: zodResolver(createSiteSchema) as any,
    defaultValues: {
      cod: "",
      name: "",
      numberWorkersContract: 0,
      customerId: "",
      areaId: "",
      contactId: "",
      addressId: "",
      sectorId: "",
      zoneId: "",
      companyId: companyId,
      geoLocationId: "",
    },
  });
  
  useEffect(() => {
    const d = props.initialData;
    if (!d) return;
    form.reset({
      cod: d.cod || "",
      name: d.name || "",
      numberWorkersContract: d.numberWorkersContract ?? 0,
      customerId: d.customerId || "",
      areaId: d.areaId || "",
      contactId: d.contactId || "",
      addressId: d.addressId || "",
      sectorId: d.sectorId || "",
      zoneId: d.zoneId || "",
      companyId: d.companyId || companyId,
      geoLocationId: (d as any).geoLocationId || "",
    });
  }, [props.initialData, form, companyId]);
  const onSubmit = async (data: CreateSite) => {
    try {
      setIsSubmitting(true);
      if (props.id && updateSite) {
        await updateSite.mutateAsync({ id: props.id, data: { ...data, companyId: (data as any).companyId || companyId } as any });
      } else {
        await createSite.mutateAsync({ ...data, companyId: (data as any).companyId || companyId } as any);
      }
      if (props.onSuccess) props.onSuccess(); else form.reset();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
  
        <h1 className="text-3xl font-bold text-slate-900">Novo Site</h1>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className=" py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label htmlFor="cod" className="text-slate-700">
                Código *
              </Label>
              <Input
                id="cod"
                {...form.register("cod")}
                placeholder="Digite o código"
                className="rounded-lg"
              />
              {form.formState.errors.cod && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.cod.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">
                Nome *
              </Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Digite o nome"
                className="rounded-lg"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberWorkersContract" className="text-slate-700">
                Número de Trabalhadores *
              </Label>
              <Input
                id="numberWorkersContract"
                type="number"
                {...form.register("numberWorkersContract", {
                  valueAsNumber: true,
                })}
                placeholder="Digite o número de trabalhadores"
                className="rounded-lg"
              />
              {form.formState.errors.numberWorkersContract && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.numberWorkersContract.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerId" className="text-slate-700">
                Selecione o Cliente *
              </Label>
              <CustomerSelect
                value={form.watch("customerId")}
                onChange={(value) => {
                  form.setValue("customerId", value);
                }}
                companyId={companyId}
              />
              {form.formState.errors.customerId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.customerId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaId" className="text-slate-700">
                Selecione a Área *
              </Label>
              <AreaSelect
                value={form.watch("areaId")}
                onChange={(value) => form.setValue("areaId", value)}
                companyId={companyId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectorId" className="text-slate-700">
                Selecione o Setor *
              </Label>
              <SectorSelect
                value={form.watch("sectorId")}
                onChange={(value) => form.setValue("sectorId", value)}
                companyId={companyId}
                zoneId={form.watch("zoneId")}
              />
              {form.formState.errors.sectorId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.sectorId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactId" className="text-slate-700">
                Selecione o Contato *
              </Label>
              <ContactSelect
                value={form.watch("contactId")}
                onChange={(value) => form.setValue("contactId", value)}
                companyId={companyId}
              />
              {form.formState.errors.contactId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.contactId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressId" className="text-slate-700">
                Selecione o Endereço *
              </Label>
              <AddressSelect
                value={form.watch("addressId")}
                onChange={(value) => form.setValue("addressId", value)}
                companyId={companyId}
              />
              {form.formState.errors.addressId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.addressId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zoneId" className="text-slate-700">
                Selecione a Zona
              </Label>
              <ZoneSelect
                value={form.watch("zoneId")}
                onChange={(value: string) => {
                  form.setValue("zoneId", value);
                  form.setValue("sectorId", "");
                }}
                companyId={companyId}
                areaId={form.watch("areaId")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="geoLocationEntityId" className="text-slate-700">
                Geolocalização *
              </Label>
              <div>
                <Input
                  id="geoLocationEntityId"
                  {...form.register("geoLocationId")}
                  placeholder="geolocalização (ex.: GEO-XYZ)"
                  className="rounded-lg "
                  type="text"
                />
              </div>

              {form.formState.errors.geoLocationId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.geoLocationId.message}
                </p>
              )}
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => (props.onCancel ? props.onCancel() : router.back())}
              className="rounded-lg px-6 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (updateSite?.isPending ?? false) || (createSite?.isPending ?? false)}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6"
            >
              {isSubmitting || (updateSite?.isPending ?? false) || (createSite?.isPending ?? false)
                ? "Salvando..."
                : props.id
                ? "Atualizar Site"
                : "Criar Site"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
