import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
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
import type { Address } from "@/types/domain";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const { data: addresses = [], isLoading } = useAddresses(companyId);
  
  const createAddress = useCreateAddress();
  const form = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      houseHold: "",
      commune: "",
      municipality: "",
      province: "",
      country: "Angola",
      companyId: companyId || undefined,
    },
  });

  function handleSubmit(data: AddressForm) {
    createAddress.mutate(data, {
      
      onSuccess: (created: Address) => {
        setOpen(false);
        onChange(created.id!);
        form.reset();
      },
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um endereço" />
        </SelectTrigger>
        <SelectContent>
          {addresses.length === 0 && (
            <div className="text-center text-muted-foreground py-2 text-sm">
              Nenhum endereço encontrado.
            </div>
          )}
          {addresses.map((a: Address) => a.id && (
            <SelectItem key={a.id} value={a.id}>
              {a.houseHold || '-'} - {a.commune || '-'} / {a.municipality || '-'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="cursor-pointer"
      >
        <Plus className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>Criar Endereço</DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-3 mt-2 grid grid-cols-2 gap-4"
          >
            <div className="col-span-2">
              <Label htmlFor="houseHold" className="mb-2 block">Domicílio</Label>
              <Input
                id="houseHold"
                {...form.register("houseHold")}
                placeholder="domicílio"
              />
              {form.formState.errors.houseHold && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.houseHold.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="commune" className="mb-2 block">Comuna</Label>
              <Input
                id="commune"
                {...form.register("commune")}
                placeholder="Comuna"
              />
              {form.formState.errors.commune && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.commune.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="municipality" className="mb-2 block">Município</Label>
              <Input
                id="municipality"
                {...form.register("municipality")}
                placeholder="Município"
              />
              {form.formState.errors.municipality && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.municipality.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="province" className="mb-2 block">Província</Label>
              <Input
                id="province"
                {...form.register("province")}
                placeholder="Província"
                
              />
              {form.formState.errors.province && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.province.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="country" className="mb-2 block">País</Label>
              <Input
                id="country"
                {...form.register("country")}
                placeholder="País"
              />
              {form.formState.errors.country && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.country.message}
                </span>
              )}
            </div>
            <div className="col-span-2 flex justify-end mt-4">
              <Button
                type="submit"
                className="px-6 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
