import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Address, Contact, Customer } from "@/infrastructure/types/domain";

interface CustomersViewProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  address?: Address;
  contact?: Contact;
}

export function CustomersView({ isOpen, onClose, customer, address, contact }: CustomersViewProps) {
  if (!customer) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-auto" >
        <DrawerHeader>
          <DrawerTitle>Detalhes do Cliente</DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Código</p>
              <p className="font-semibold text-slate-900">{customer.cod}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-semibold text-slate-900">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nome Fiscal</p>
              <p className="font-semibold text-slate-900">{customer.taxName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">NIF</p>
              <p className="font-mono text-slate-900">{customer.nif}</p>
            </div>
          </div>

          {address && (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Endereço
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Domicílio</p>
                  <p className="text-slate-900">{address.houseHold}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Comuna</p>
                  <p className="text-slate-900">{address.commune}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Município</p>
                  <p className="text-slate-900">{address.municipality}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Província</p>
                  <p className="text-slate-900">{address.province}</p>
                </div>
              </div>
            </div>
          )}

          {contact && (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Contato
              </p>
              <div className="space-y-2 text-sm">
                {(contact.phoneNumbers || []).map((p) => (
                  <div key={p.phone}>
                    <p className="text-muted-foreground">Telefone</p>
                    <p className="text-slate-900">{p.phone}</p>
                  </div>
                ))}
                {contact.email && (
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="text-slate-900">{contact.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}