"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createSiteSchema,
  type CreateSite,
} from "@/infrastructure/schema/schema-sites";
import { useCreateSite } from "@/infrastructure/hooks/useSites";
import { useUpdateSite as useUpdateSiteHook } from "@/infrastructure/hooks/useSites";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { SectorSelect } from "@/components/common/base-ui/selects/sector-select";
import { ContactSelect } from "@/components/common/base-ui/selects/contact-select";
import { AddressSelect } from "@/components/common/base-ui/selects/address-select";
import { ZoneSelect } from "@/components/common/base-ui/selects/zone-select";
import { AreaSelect } from "@/components/common/base-ui/selects/area-select";
import { CustomerSelect } from "@/components/common/base-ui/selects/customer-select";
import type { Site } from "@/infrastructure/types/domain";
import { Loader2 } from "lucide-react";

interface SiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteToEdit?: Site;
  customerId?: string;
  companyId?: string;
  onSuccess?: (site: Site) => void;
}

export function SiteDialog({
  open,
  onOpenChange,
  siteToEdit,
  customerId: propCustomerId,
  companyId: propCompanyId,
  onSuccess,
}: SiteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const storeCompanyId = useAuthStore((state) => state.companyId);
  const companyId = propCompanyId || storeCompanyId || "";
  const createSite = useCreateSite();
  const updateSite = useUpdateSiteHook();

  const form = useForm<CreateSite>({
    resolver: zodResolver(createSiteSchema) as any,
    defaultValues: {
      cod: "",
      name: "",
      numberWorkersContract: 0,
      customerId: propCustomerId || "",
      areaId: "",
      contactId: "",
      addressId: "",
      sectorId: "",
      zoneId: "",
      companyId: companyId,
      geoLocationId: "",
    },
  });


  const getId = (val: string | any | any[] | undefined) => {
    if (typeof val === 'string') return val;
    if (!val) return "";
    if (Array.isArray(val) && val.length > 0) return val[0]?.id || "";
    if (typeof val === 'object' && val.id) return val.id;
    return "";
  };

  useEffect(() => {
    if (siteToEdit) {
      form.reset({
        cod: siteToEdit.cod || "",
        name: siteToEdit.name || "",
        numberWorkersContract: siteToEdit.numberWorkersContract ?? 0,
        customerId: siteToEdit.customerId || getId(siteToEdit.customer) || getId(siteToEdit.customers) || propCustomerId || "",
        areaId: siteToEdit.areaId || getId(siteToEdit.area) || getId(siteToEdit.areas) || "",
        contactId: siteToEdit.contactId || getId(siteToEdit.contact) || "",
        addressId: siteToEdit.addressId || getId(siteToEdit.address) || "",
        sectorId: siteToEdit.sectorId || getId(siteToEdit.sector) || getId(siteToEdit.sectors) || "",
        zoneId: siteToEdit.zoneId || getId(siteToEdit.zone) || getId(siteToEdit.zones) || "",
        companyId: siteToEdit.companyId || companyId,
        geoLocationId: (siteToEdit as any).geoLocationId || "",
      });
    } else {
      form.reset({
        cod: "",
        name: "",
        numberWorkersContract: 0,
        customerId: propCustomerId || "",
        areaId: "",
        contactId: "",
        addressId: "",
        sectorId: "",
        zoneId: "",
        companyId: companyId,
        geoLocationId: "",
      });
    }
  }, [siteToEdit, form, companyId, propCustomerId, open]);

  const onSubmit = async (data: CreateSite) => {
    try {
      setIsSubmitting(true);
      let savedSite;
      if (siteToEdit) {
        savedSite = await updateSite.mutateAsync({
          id: siteToEdit.id!,
          data: {
            ...data,
            companyId: (data as any).companyId || companyId,
          } as any,
        });
      } else {
        savedSite = await createSite.mutateAsync({
          ...data,
          companyId: (data as any).companyId || companyId,
        } as any);
      }
      onOpenChange(false);
      form.reset();
      if (onSuccess && savedSite) {
        onSuccess(savedSite as Site);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = isSubmitting || createSite.isPending || updateSite.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden dark:bg-slate-950">
        <DialogHeader className="pt-6 px-6 pb-2 border-b border-gray-100 bg-white dark:bg-slate-900/50">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {siteToEdit ? "Editar Site" : "Novo Site"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="customerId"
                      className="text-slate-700 font-medium"
                    >
                      Cliente *
                    </Label>
                    <CustomerSelect
                      value={form.watch("customerId")}
                      onChange={(value) => {
                        form.setValue("customerId", value);
                      }}
                      companyId={companyId}
                      disabled={!!propCustomerId}
                    />
                    {form.formState.errors.customerId && (
                      <p className="text-sm text-red-500 font-medium">
                        {form.formState.errors.customerId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cod" className="text-slate-700 font-medium">
                      Código *
                    </Label>
                    <Input
                      id="cod"
                      {...form.register("cod")}
                      placeholder="Ex: ST-001"
                      className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    />
                    {form.formState.errors.cod && (
                      <p className="text-sm text-red-500 font-medium">
                        {form.formState.errors.cod.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 ">
                    <Label htmlFor="name" className="text-slate-700 font-medium">
                      Nome do Site *
                    </Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Ex: Obra Central"
                      className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500 font-medium">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                     <div className="space-y-2">
                <Label
                  htmlFor="geoLocationEntityId"
                  className="text-slate-700 font-medium"
                >
                  Geolocalização *
                </Label>
                <Input
                  id="geoLocationEntityId"
                  {...form.register("geoLocationId")}
                  placeholder="ID da Geolocalização (ex.: GEO-XYZ)"
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
                {form.formState.errors.geoLocationId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.geoLocationId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="numberWorkersContract"
                  className="text-slate-700 font-medium"
                >
                  Nº Trabalhadores *
                </Label>
                <Input
                  id="numberWorkersContract"
                  type="number"
                  {...form.register("numberWorkersContract", {
                    valueAsNumber: true,
                  })}
                  placeholder="0"
                  className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
                {form.formState.errors.numberWorkersContract && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.numberWorkersContract.message}
                  </p>
                )}
              </div>


              <div className="space-y-2">
                <Label htmlFor="areaId" className="text-slate-700 font-medium">
                  Área Operacional *
                </Label>
                <AreaSelect
                  value={form.watch("areaId")}
                  onChange={(value) => {
                    form.setValue("areaId", value);
                    form.setValue("zoneId", "");
                    form.setValue("sectorId", "");
                  }}
                  companyId={companyId}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoneId" className="text-slate-700 font-medium">
                  Zona
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

              <div className="space-y-2">
                <Label htmlFor="sectorId" className="text-slate-700 font-medium">
                  Sector *
                </Label>
                <SectorSelect
                  value={form.watch("sectorId")}
                  onChange={(value) => form.setValue("sectorId", value)}
                  companyId={companyId}
                  zoneId={form.watch("zoneId")}
                />
                {form.formState.errors.sectorId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.sectorId.message}
                  </p>
                )}
              </div>


              <div className="space-y-2">
                <Label htmlFor="contactId" className="text-slate-700 font-medium">
                  Contato  *
                </Label>
                <ContactSelect
                  value={form.watch("contactId")}
                  onChange={(value) => form.setValue("contactId", value)}
                  companyId={companyId}
                />
                {form.formState.errors.contactId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.contactId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressId" className="text-slate-700 font-medium">
                  Morada *
                </Label>
                <AddressSelect
                  value={form.watch("addressId")}
                  onChange={(value) => form.setValue("addressId", value)}
                  companyId={companyId}
                />
                {form.formState.errors.addressId && (
                  <p className="text-sm text-red-500 font-medium">
                    {form.formState.errors.addressId.message}
                  </p>
                )}
              </div>
                </div>
                
              </div>

           
            </div>
          </div>

          <DialogFooter className=" p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="shadow-lg rounded-xl px-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A guardar...
                </>
              ) : siteToEdit ? (
                "Atualizar Dados"
              ) : (
                "Criar Site"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

