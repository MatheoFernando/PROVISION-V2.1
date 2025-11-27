"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { Address, Company, Contact } from "@/infrastructure/types/domain";
import {
  Building2,
  CalendarCheck,
  Hash,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";

type CompanyWithRelations = Company & {
  addresses?: (Address | null)[] | Address | null;
  contacts?: (Contact | null)[] | Contact | null;
};

interface CompanyViewProps {
  open: boolean;
  onClose: () => void;
  company: CompanyWithRelations | null;
  onEdit?: (company: Company) => void;
}

const formatDate = (value?: string): string => {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const resolveAddress = (data?: CompanyWithRelations | null): Address | null => {
  if (!data) return null;
  if (data.address) return data.address;
  if (Array.isArray(data.addresses)) {
    return (
      data.addresses.find((item): item is Address => Boolean(item)) ?? null
    );
  }
  return (data.addresses as Address) ?? null;
};

const resolveContact = (data?: CompanyWithRelations | null): Contact | null => {
  if (!data) return null;
  if (data.contact) return data.contact;
  if (Array.isArray(data.contacts)) {
    return (
      data.contacts.find((item): item is Contact => Boolean(item)) ?? null
    );
  }
  return (data.contacts as Contact) ?? null;
};

export function CompanyView({
  open,
  onClose,
  company,
  onEdit,
}: CompanyViewProps) {
  if (!company) return null;

  const address = resolveAddress(company);
  const contact = resolveContact(company);
  const phoneNumbers = contact?.phoneNumbers ?? [];
  const hasAddress =
    !!address &&
    !!(
      address.houseHold ||
      address.commune ||
      address.municipality ||
      address.province ||
      address.country
    );
  const hasContact =
    !!contact && (phoneNumbers.length > 0 || Boolean(contact.email));

  return (
    <Drawer
      open={open}
      direction="right"
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DrawerContent className="ml-auto flex h-full max-h-screen w-full max-w-md flex-col border-l border-slate-200">
        <DrawerHeader className="relative border-b border-slate-200 px-6 py-6">
          <DrawerTitle className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <Building2 className="h-5 w-5 text-slate-500" />
            Detalhes da Empresa
          </DrawerTitle>
  
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex  items-center  gap-4  border-b pb-3">
            <Avatar className="h-16 w-16 rounded-lg">
              <AvatarImage
                src={company.photo || undefined}
                alt={company.businessName}
                className="rounded-lg"
              />
              <AvatarFallback className="rounded-full text-lg font-semibold text-slate-900">
                {company.businessName?.charAt(0)?.toUpperCase() ?? "E"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {company.businessName}
              </p>
              <p className="text-sm text-slate-500">{company.taxName}</p>
            </div>
            <Badge
              variant={company.status ? "default" : "secondary"}
              className={`rounded-full px-3 py-1 text-xs ${
                company.status
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {company.status ? "Ativa" : "Inativa"}
            </Badge>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-semiboldtracking-wide text-slate-600">
                Informações Gerais
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Código", value: company.cod, icon: Hash },
                { label: "NIF", value: company.nif, icon: Tag },
                {
                  label: "Data de Fundação",
                  value: formatDate(company.hasExistedSince),
                  icon: CalendarCheck,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3  bg-slate-50 p-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center ">
                    <item.icon className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {item.label}
                    </span>
                    <span className="text-base font-semibold text-slate-900">
                      {item.value || "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {hasContact && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Contato
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                {phoneNumbers.map((phone) => (
                  <div
                    key={phone.phone}
                    className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-2 shadow-sm"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50">
                      <Phone className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-base font-medium text-slate-900">
                      {phone.phone}
                    </span>
                  </div>
                ))}
                {contact?.email && (
                  <div className="flex items-center gap-3 rounded-md  bg-slate-50 p-2 ">
                    <div className="flex h-8 w-8 items-center justify-center ">
                      <Mail className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-base font-medium text-slate-900">
                      {contact.email}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {hasAddress && (
            <section className="space-y-4 ">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold  tracking-wide text-slate-600">
                  Endereço
                </h3>
              </div>
              <div className="space-y-3 rounded-md bg-slate-50  p-2 text-sm ">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md ">
                    <Building2 className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1 space-y-2 text-slate-900">
                    {address?.houseHold && (
                      <p className="text-base font-semibold">
                        {address.houseHold}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                      {address?.municipality && (
                        <span>Município: {address.municipality}</span>
                      )}
                      {address?.commune && (
                        <span>Comuna: {address.commune}</span>
                      )}
                      {address?.province && (
                        <span>Província: {address.province}</span>
                      )}
                      {address?.country && <span>País: {address.country}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div> 
      </DrawerContent>
    </Drawer>
  );
}
