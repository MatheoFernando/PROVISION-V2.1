import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  useAddresses,
  useAddressById,
  useCreateAddress,
} from "@/infrastructure/hooks/useAddresses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { addressSchema } from "@/infrastructure/schema/schema-address";
import type { Address } from "@/infrastructure/types/domain";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useAngolaProvinces } from "@/infrastructure/hooks/useAngolaLocations";

type AddressForm = z.infer<typeof addressSchema>;

interface AddressSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string;
}

export function AddressSelect({
  value: valueProp,
  onChange,
  companyId,
}: AddressSelectProps) {
  const value = valueProp && valueProp.trim() !== '' ? valueProp : undefined;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [createdAddresses, setCreatedAddresses] = useState<Array<Address & { createdAt?: string }>>([]);

  const authCompanyId = useAuthStore((s) => s.companyId);
  const effectiveCompanyId = companyId ?? authCompanyId ?? undefined;

  const {
    data: addresses = [],
    isLoading,
    isFetching,
    refetch,
  } = useAddresses(effectiveCompanyId);

  // Carrega o endereço pelo ID quando estamos a editar (getById)
  const { data: addressById } = useAddressById(value);

  const createAddress = useCreateAddress();
  const form = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      houseHold: "",
      commune: "",
      municipality: "",
      province: "",
      country: "Angola",
      companyId: effectiveCompanyId || undefined,
    },
  });

  const { data: provincesData = [], isPending: loadingProvinces } =
    useAngolaProvinces();

  const selectedProvinceName = form.watch("province");
  const selectedMunicipalityName = form.watch("municipality");

  const selectedProvince = useMemo(
    () =>
      provincesData.find(
        (province) => province.name === selectedProvinceName
      ) ?? null,
    [provincesData, selectedProvinceName]
  );

  const municipalities = selectedProvince?.municipalities ?? [];

  const selectedMunicipality = useMemo(
    () =>
      municipalities.find(
        (municipality) => municipality.name === selectedMunicipalityName
      ) ?? null,
    [municipalities, selectedMunicipalityName]
  );

  const communes = selectedMunicipality?.communes ?? [];

  useEffect(() => {
    if (value) {
      setSelectedAddressId(value);
    } else {
      setSelectedAddressId(null);
    }
  }, [value]);

  useEffect(() => {
    form.reset({
      houseHold: "",
      commune: "",
      municipality: "",
      province: "",
      country: "Angola",
      companyId: effectiveCompanyId || undefined,
    });
  }, [effectiveCompanyId, form, open]);

  function handleSubmit(data: AddressForm) {
    createAddress.mutate(data, {
      onSuccess: (created: Address) => {
        setOpen(false);
        if (created?.id) {
          const addressWithMeta = created as Address & { createdAt?: string };
          const normalizedAddress: Address & { createdAt?: string } = {
            ...addressWithMeta,
            id: created.id,
            houseHold: created?.houseHold ?? "",
            commune: created?.commune ?? "",
            municipality: created?.municipality ?? "",
            province: created?.province ?? "",
            country: created?.country ?? "",
            companyId: created?.companyId ?? effectiveCompanyId,
            createdAt: addressWithMeta.createdAt ?? new Date().toISOString(),
          };

          setCreatedAddresses((prev) => {
            if (prev.some((item) => item.id === created.id)) return prev;
            return [normalizedAddress, ...prev];
          });

          setTimeout(() => {
            setSelectedAddressId(created.id!);
            onChange(created.id!);
          }, 0);
        }
        form.reset();
        void refetch();
      },
    });
  }

  const addressesList = useMemo(() => {
    const baseList = Array.isArray(addresses) ? addresses : [];

    const merged: Array<Address & { createdAt?: string }> = [
      ...createdAddresses,
      ...baseList,
    ];

    // Quando estamos a editar e o endereço não veio no getAll,
    // garantimos que o resultado do getById também entra na lista.
    if (addressById && addressById.id) {
      merged.push({
        ...(addressById as Address & { createdAt?: string }),
        id: addressById.id,
        houseHold: addressById.houseHold ?? "",
        commune: addressById.commune ?? "",
        municipality: addressById.municipality ?? "",
        province: addressById.province ?? "",
        country: addressById.country ?? "",
      });
    }
    const map = new Map<string, Address & { createdAt?: string }>();
    merged.forEach((address) => {
      if (!address?.id) return;
      map.set(address.id, {
        ...address,
        id: address.id,
        houseHold: address.houseHold ?? "",
        createdAt:
          (address as Address & { createdAt?: string }).createdAt ??
          new Date().toISOString(),
      });
    });
    return Array.from(map.values()).sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [createdAddresses, addresses]);

  const filtered = useMemo(
    () =>
      addressesList.filter((a: Address) =>
        [a.houseHold, a.commune, a.municipality, a.province, a.country]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [addressesList, query]
  );

  useEffect(() => {
    if (value && addressesList.length > 0) {
      const addressExists = addressesList.some(addr => addr.id === value);
      if (addressExists) {
        setSelectedAddressId(value);
      }
    }
  }, [value, addressesList]);

  const isLoadingOptions = isLoading || isFetching;
  const isSaving = createAddress.status === "pending";

  const displayValue = useMemo(() => {
    const normalizedValue = value && value.trim() !== '' ? value : undefined;

    if (!normalizedValue) {
      return undefined;
    }

    const exists = addressesList.some(addr => addr.id === normalizedValue);
    return exists ? normalizedValue : undefined;
  }, [value, addressesList]);

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select
          value={displayValue}
          onValueChange={(val) => {
            setSelectedAddressId(val);
            onChange(val);
          }}
          disabled={isLoadingOptions}
          onOpenChange={() => refetch()}
        >
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Selecione um endereço" />
          </SelectTrigger>
          {isLoadingOptions && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-1 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar endereços..."
                className="w-full placeholder:text-xs"
                disabled={isLoadingOptions || addressesList.length === 0}
              />
            </div>
            {filtered.length === 0 && (
              <div className="text-center text-muted-foreground py-2 text-sm">
                Não há dados disponíveis
              </div>
            )}
            <div
              className={
                filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"
              }
            >
              {filtered.map(
                (a: Address) =>
                  a.id && (
                    <SelectItem
                      key={a.id}
                      value={a.id}
                      className="cursor-pointer"
                    >
                      {a.houseHold || "-"}
                    </SelectItem>
                  )
              )}
            </div>
          </SelectContent>
        </Select>
      </div>
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (isSaving) return;
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="cursor-pointer shrink-0"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-[26rem] p-4"
          onInteractOutside={(e) => {
            if (isSaving) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isSaving) e.preventDefault();
          }}
        >
          <div className="font-medium mb-4 text-lg">Criar Endereço</div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(handleSubmit)();
            }}
            className="space-y-3 mt-2 grid grid-cols-2 gap-3"
          >
            <div className="col-span-2">
              <Label htmlFor="houseHold" className="mb-2 block">
                Endereço
              </Label>
              <Input
                id="houseHold"
                {...form.register("houseHold")}
                placeholder="domicílio"
                disabled={isSaving}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
              {form.formState.errors.houseHold && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.houseHold.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="country" className="mb-2 block">
                País
              </Label>
              <Input
                id="country"
                {...form.register("country")}
                placeholder="País"
                disabled={isSaving}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
              {form.formState.errors.country && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.country.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="province" className="mb-2 block">
                Província
              </Label>
              <Select
                value={form.watch("province")}
                onValueChange={(value) => {
                  form.setValue("province", value, { shouldValidate: true });
                  form.setValue("municipality", "", { shouldValidate: true });
                  form.setValue("commune", "", { shouldValidate: true });
                }}
                disabled={loadingProvinces || isSaving}
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
              {form.formState.errors.province && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.province.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="municipality" className="mb-2 block">
                Município
              </Label>
              <Select
                value={form.watch("municipality")}
                onValueChange={(value) => {
                  form.setValue("municipality", value, { shouldValidate: true });
                  form.setValue("commune", "", { shouldValidate: true });
                }}
                disabled={municipalities.length === 0 || isSaving}
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
                <SelectContent>
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
              {form.formState.errors.municipality && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.municipality.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="commune" className="mb-2 block">
                Comuna
              </Label>
              <Select
                value={form.watch("commune")}
                onValueChange={(value) =>
                  form.setValue("commune", value, { shouldValidate: true })
                }
                disabled={communes.length === 0 || isSaving}
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
                <SelectContent>
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
              {form.formState.errors.commune && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.commune.message}
                </span>
              )}
            </div>


            <div className="col-span-2 flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={isSaving}
                onClick={() => {
                  if (isSaving) return;
                  form.reset();
                  setOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="px-6 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isSaving}
                onClick={() => form.handleSubmit(handleSubmit)()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
