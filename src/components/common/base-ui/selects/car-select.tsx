import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useCars } from "@/infrastructure/hooks/useCars";

interface CarSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string | null;
}

export function CarSelect({ value, onChange, companyId }: CarSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { companyId: storeCompanyId } = useAuthStore();
  const normalizedCompanyId = companyId ?? storeCompanyId ?? "";

  const { data: cars = [], isLoading } = useCars({
    companyId: normalizedCompanyId,
    enabled: !!normalizedCompanyId,
  });

  const selectedCar = cars.find((car) => car.id === value);

  const filteredCars = cars.filter((car) =>
    `${car.mark} ${car.model} ${car.cod}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal  text-sm"
          disabled={!normalizedCompanyId || isLoading}
        >
          {value
            ? selectedCar
              ? `${selectedCar.mark} ${selectedCar.model} (${selectedCar.cod})`
              : isLoading
              ? "Carregando..."
              : "Viatura não encontrada"
            : "Selecione uma viatura..."}
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Pesquisar viatura..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CommandList>
            {filteredCars.length === 0 && (
              <CommandEmpty>Nenhuma viatura encontrada.</CommandEmpty>
            )}
            <CommandGroup>
              {filteredCars.map((car) => (
                <CommandItem
                  key={car.id}
                  value={`${car.mark} ${car.model} ${car.cod}`}
                  onClick={() => {
                    if (car.id) {
                      onChange(car.id);
                      setOpen(false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === car.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {car.mark} {car.model} ({car.cod})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}