import { useMemo, useState } from "react";
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
  value,
  onChange,
  companyId,
}: AddressSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const authCompanyId = useAuthStore((s) => s.companyId);
  const effectiveCompanyId = companyId ?? authCompanyId ?? undefined;
  const { data: addresses = [], isLoading } = useAddresses(effectiveCompanyId);

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

  function handleSubmit(data: AddressForm) {
    createAddress.mutate(data, {
      onSuccess: (created: Address) => {
        setOpen(false);
        onChange(created.id!);
        form.reset();
      },
    });
  }

  const filtered = (Array.isArray(addresses) ? addresses : []).filter(
    (a: Address) =>
      [a.houseHold, a.commune, a.municipality, a.province, a.country]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <Select
          value={value}
          onValueChange={(val) => {
            const selected = (Array.isArray(addresses) ? addresses : []).find(
              (a: Address) => a.id === val
            );

            onChange(val);
          }}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Selecione um endereço" />
          </SelectTrigger>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <div className="p-1 sticky top-0 bg-popover">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar endereços..."
                className="w-full placeholder:text-xs"
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
          const isSaving = createAddress.status === "pending";
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
            disabled={createAddress.status === "pending"}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-[26rem] p-4"
          onInteractOutside={(e) => {
            if (createAddress.status === "pending") e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (createAddress.status === "pending") e.preventDefault();
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
                disabled={loadingProvinces}
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
                disabled={municipalities.length === 0}
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
                disabled={communes.length === 0}
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
                disabled={createAddress.status === "pending"}
                onClick={() => {
                  if (createAddress.status !== "pending") {
                    form.reset();
                    setOpen(false);
                  }
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="px-6 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                disabled={createAddress.status === "pending"}
                onClick={() => form.handleSubmit(handleSubmit)()}
              >
                {createAddress.status === "pending" ? (
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
