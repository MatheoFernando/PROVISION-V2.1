"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateGrossSite } from "@/infrastructure/hooks/useSites";
import { useCustomerById } from "@/infrastructure/hooks/useCustomers";
// Removed redundant list hooks as requested by user
import { useUpdateSite as useUpdateSiteHook } from "@/infrastructure/hooks/useSites";

import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useAngolaProvinces } from "@/infrastructure/hooks/useAngolaLocations";
import { SectorSelect } from "@/components/common/base-ui/selects/sector-select";
import { ZoneSelect } from "@/components/common/base-ui/selects/zone-select";
import { AreaSelect } from "@/components/common/base-ui/selects/area-select";
import { CustomerSelect } from "@/components/common/base-ui/selects/customer-select";
import type { Site } from "@/infrastructure/types/domain";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const grossSiteSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  numberWorkersContract: z.number().min(0, "Número de trabalhadores deve ser positivo"),
  nameArea: z.string().optional().or(z.literal("")),
  codCustomer: z.string().min(1, "Cliente é obrigatório"),
  nameZone: z.string().optional().or(z.literal("")),
  nameSector: z.string().optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  houseHold: z.string().optional().or(z.literal("")),
  commune: z.string().optional().or(z.literal("")),
  municipality: z.string().optional().or(z.literal("")),
  province: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
});

type GrossSiteInput = z.infer<typeof grossSiteSchema>;

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
  const createGrossSite = useCreateGrossSite();
  const updateSite = useUpdateSiteHook();

  const form = useForm<GrossSiteInput>({
    resolver: zodResolver(grossSiteSchema),
    defaultValues: {
      cod: "",
      name: "",
      numberWorkersContract: 0,
      codCustomer: "",
      nameArea: "",
      nameZone: "",
      nameSector: "",
      companyId: companyId,
      email: "",
      phone: "",
      houseHold: "",
      commune: "",
      municipality: "",
      province: "",
      country: "Angola",
    },
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedSectorId, setSelectedSectorId] = useState("");

  const { data: selectedCustomer } = useCustomerById(selectedCustomerId || undefined);
  
  // Estados para armazenar os nomes selecionados diretamente dos componentes Select
  const [selectedAreaName, setSelectedAreaName] = useState(siteToEdit?.nameArea || "");
  const [selectedZoneName, setSelectedZoneName] = useState(siteToEdit?.nameZone || "");
  const [selectedSectorName, setSelectedSectorName] = useState(siteToEdit?.nameSector || "");


  // Lógica de seleção encadeada de endereços (Angola)
  const { data: provincesData = [], isPending: loadingProvinces } = useAngolaProvinces();

  const provinceValue = form.watch("province");
  const municipalityValue = form.watch("municipality");

  const selectedProvince = useMemo(
    () => provincesData.find((province) => province.name === provinceValue) ?? null,
    [provincesData, provinceValue]
  );

  const municipalities = useMemo(
    () => selectedProvince?.municipalities ?? [],
    [selectedProvince]
  );

  const selectedMunicipality = useMemo(
    () => municipalities.find((municipality) => municipality.name === municipalityValue) ?? null,
    [municipalities, municipalityValue]
  );

  const communes = selectedMunicipality?.communes ?? [];

  const getId = (val: string | any | any[] | undefined) => {
    if (typeof val === 'string') return val;
    if (!val) return "";
    if (Array.isArray(val) && val.length > 0) return val[0]?.id || "";
    if (typeof val === 'object' && val.id) return val.id;
    return "";
  };

  useEffect(() => {
    if (siteToEdit && open) {
      const customerId = siteToEdit.customerId || getId(siteToEdit.customer) || getId(siteToEdit.customers) || propCustomerId || "";
      const areaId = siteToEdit.areaId || getId(siteToEdit.area) || getId(siteToEdit.areas) || "";
      const zoneId = siteToEdit.zoneId || getId(siteToEdit.zone) || getId(siteToEdit.zones) || "";
      const sectorId = siteToEdit.sectorId || getId(siteToEdit.sector) || getId(siteToEdit.sectors) || "";

      setSelectedCustomerId(customerId);
      setSelectedAreaId(areaId);
      setSelectedZoneId(zoneId);
      setSelectedSectorId(sectorId);

      form.reset({
        cod: siteToEdit.cod || "",
        name: siteToEdit.name || "",
        numberWorkersContract: siteToEdit.numberWorkersContract ?? 0,
        codCustomer: siteToEdit.customer?.cod || "",
        nameArea: siteToEdit.area?.name || "",
        nameZone: siteToEdit.zone?.name || "",
        nameSector: siteToEdit.sector?.name || "",
        companyId: siteToEdit.companyId || companyId,
        email: siteToEdit.contact?.email || "",
        phone: siteToEdit.contact?.phoneNumbers?.[0]?.phone || "",
        houseHold: siteToEdit.address?.houseHold || "",
        commune: siteToEdit.address?.commune || "",
        municipality: siteToEdit.address?.municipality || "",
        province: siteToEdit.address?.province || "",
        country: siteToEdit.address?.country || "",
      });
    } else if (open) {
      setSelectedCustomerId(propCustomerId || "");
      setSelectedAreaId("");
      setSelectedZoneId("");
      setSelectedSectorId("");

      form.reset({
        cod: "",
        name: "",
        numberWorkersContract: 0,
        codCustomer: "",
        nameArea: "",
        nameZone: "",
        nameSector: "",
        companyId: companyId,
        email: "",
        phone: "",
        houseHold: "",
        commune: "",
        municipality: "",
        province: "",
        country: "Angola",
      });
    }
  }, [siteToEdit, form, companyId, propCustomerId, open]);

  useEffect(() => {
    if (selectedCustomer) {
      form.setValue("codCustomer", selectedCustomer.cod || "");
    }
  }, [selectedCustomer, form]);



  const onSubmit = async (data: GrossSiteInput) => {
    try {
      setIsSubmitting(true);
      
      if (!selectedAreaId) {
        toast.error("Por favor, selecione uma área");
        setIsSubmitting(false);
        return;
      }
      
      if (!selectedSectorId) {
        toast.error("Por favor, selecione um sector");
        setIsSubmitting(false);
        return;
      }
      
      const currentCompanyId = companyId || useAuthStore.getState().companyId || "";
      
      if (!currentCompanyId) {
        toast.error("Erro: ID da empresa não encontrado. Tente recarregar a página.");
        setIsSubmitting(false);
        return;
      }
      
      let savedSite;
      if (siteToEdit) {
        savedSite = await updateSite.mutateAsync({
          id: siteToEdit.id!,
          data: {
            ...data,
            nameArea: selectedAreaName,
            nameZone: selectedZoneName,
            nameSector: selectedSectorName,
            companyId: currentCompanyId,
          } ,
        });
        toast.success("Site atualizado com sucesso!");
      } else {
        const grossPayload: any = {
          cod: data.cod,
          name: data.name,
          numberWorkersContract: data.numberWorkersContract,
          companyId: currentCompanyId,
          nameArea: selectedAreaName,
          codCustomer: data.codCustomer,
          nameZone: selectedZoneName,
          nameSector: selectedSectorName,
        };

        // Adicionar contato se houver dados
        if (data.email || data.phone) {
          grossPayload.contact = {
            companyId: currentCompanyId,
            email: data.email || undefined,
            phoneNumbers: data.phone ? [{ phone: data.phone }] : undefined,
          };
        }

        // Adicionar endereço se houver dados
        if (data.houseHold || data.commune || data.municipality || data.province || data.country) {
          grossPayload.address = {
            houseHold: data.houseHold || "",
            commune: data.commune || "",
            municipality: data.municipality || "",
            province: data.province || "",
            country: data.country || "Angola",
            companyId: currentCompanyId,
          };
        }

        savedSite = await createGrossSite.mutateAsync(grossPayload);
        toast.success("Site criado com sucesso!");
      }
      onOpenChange(false);
      form.reset();
      if (onSuccess && savedSite) {
        onSuccess(savedSite as Site);
      }
    } catch (error) {
      console.error("[SiteDialog] Erro ao salvar:", error);
      toast.error("Erro ao salvar o site");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = isSubmitting || createGrossSite.isPending || updateSite.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden dark:bg-slate-950">
        <DialogHeader className="pt-6 px-6 pb-2 border-b border-gray-100 bg-white dark:bg-slate-900/50">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {siteToEdit ? "Editar Site" : "Novo Site"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("[SiteDialog] Erros de validação:", errors);
          toast.error("Por favor, preencha todos os campos obrigatórios");
        })} className="flex flex-col">
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
           
            <div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customerId" className="text-slate-700 font-medium">
                    Cliente *
                  </Label>
                  <CustomerSelect
                    value={selectedCustomerId}
                    onChange={(value) => setSelectedCustomerId(value)}
                    companyId={companyId}
                    disabled={!!propCustomerId}
                  />
                  {form.formState.errors.codCustomer && (
                    <p className="text-sm text-red-500 font-medium">
                      {form.formState.errors.codCustomer.message}
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
                    className=" border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                  {form.formState.errors.cod && (
                    <p className="text-sm text-red-500 font-medium">
                      {form.formState.errors.cod.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">
                    Nome do Site *
                  </Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Ex: Obra Central"
                    className=" border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 font-medium">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberWorkersContract" className="text-slate-700 font-medium">
                    Nº Trabalhadores *
                  </Label>
                  <Input
                    id="numberWorkersContract"
                    type="number"
                    {...form.register("numberWorkersContract", {
                      valueAsNumber: true,
                    })}
                    placeholder="0"
                    className=" border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                  {form.formState.errors.numberWorkersContract && (
                    <p className="text-sm text-red-500 font-medium">
                      {form.formState.errors.numberWorkersContract.message}
                    </p>
                  )}
                </div>
            
                <div className="space-y-2 ">
                  <Label htmlFor="areaId" className="text-slate-700 font-medium">
                    Área 
                  </Label>
                  <AreaSelect
                    value={selectedAreaId}
                    onChange={(value) => {
                      setSelectedAreaId(value);
                      setSelectedZoneId("");
                      setSelectedSectorId("");
                      // Resetar nomes dependentes
                      setSelectedZoneName("");
                      setSelectedSectorName("");
                    }}
                    onSelectName={setSelectedAreaName}
                    companyId={companyId}
                  />
                  {form.formState.errors.nameArea && (
                    <p className="text-sm text-red-500 font-medium">
                      {form.formState.errors.nameArea.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zoneId" className="text-slate-700 font-medium">
                    Zona
                  </Label>
                  <ZoneSelect
                    value={selectedZoneId}
                    onChange={(value: string) => {
                      setSelectedZoneId(value);
                      setSelectedSectorId("");
                      // Resetar nome dependente
                      setSelectedSectorName("");
                    }}
                    onSelectName={setSelectedZoneName}
                    companyId={companyId}
                    areaId={selectedAreaId}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sectorId" className="text-slate-700 font-medium">
                    Sector *
                  </Label>
                  <SectorSelect
                    value={selectedSectorId}
                    onChange={(value) => setSelectedSectorId(value)}
                    onSelectName={setSelectedSectorName}
                    companyId={companyId}
                    zoneId={selectedZoneId}
                  />
                  {form.formState.errors.nameSector && (
                    <p className="text-sm text-red-500 font-medium">
                      {form.formState.errors.nameSector.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

       
            <div>
             
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="exemplo@email.com"
                    className=" border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500 font-medium">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    type="number"
                    {...form.register("phone")}
                    placeholder="+244 000 000 000"
                    className=" border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                </div>
              </div>
            </div>

       
            <div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="houseHold" className="text-slate-700 font-medium">
                    Domicílio
                  </Label>
                  <Input
                    id="houseHold"
                    {...form.register("houseHold")}
                    placeholder="Ex: Casa 123, Rua X"
                    className=" border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-slate-700 font-medium">
                    País
                  </Label>
                  <Input
                    id="country"
                    {...form.register("country")}
                    placeholder="Angola"
                    readOnly
                    className="bg-gray-50 cursor-not-allowed border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province" className="text-slate-700 font-medium">
                    Província
                  </Label>
                  <Select
                    value={form.watch("province")}
                    onValueChange={(value) => {
                      form.setValue("province", value);
                      form.setValue("municipality", "");
                      form.setValue("commune", "");
                    }}
                    disabled={loadingProvinces || isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          loadingProvinces
                            ? "Carregando províncias..."
                            : "Selecione uma província"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {provincesData.map((province) => (
                        <SelectItem
                          key={province.slug || province.name}
                          value={province.name}
                        >
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipality" className="text-slate-700 font-medium">
                    Município
                  </Label>
                  <Select
                    value={form.watch("municipality")}
                    onValueChange={(value) => {
                      form.setValue("municipality", value);
                      form.setValue("commune", "");
                    }}
                    disabled={municipalities.length === 0 || isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          loadingProvinces
                            ? "Carregando municípios..."
                            : municipalities.length === 0
                            ? "Selecione a província"
                            : "Selecione um município"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {municipalities.map((municipality) => (
                        <SelectItem
                          key={municipality.slug || municipality.name}
                          value={municipality.name}
                        >
                          {municipality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commune" className="text-slate-700 font-medium">
                    Comuna
                  </Label>
                  <Select
                    value={form.watch("commune")}
                    onValueChange={(value) => form.setValue("commune", value)}
                    disabled={communes.length === 0 || isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          selectedMunicipality
                            ? communes.length === 0
                              ? "Sem comunas disponíveis"
                              : "Selecione uma comuna"
                            : "Selecione o município"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {communes.map((commune) => (
                        <SelectItem
                          key={commune.slug || commune.name}
                          value={commune.name}
                        >
                          {commune.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 "
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="shadow-lg  px-6"
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

