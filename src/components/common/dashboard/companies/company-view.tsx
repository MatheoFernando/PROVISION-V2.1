"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getFileUrl } from "@/infrastructure/utils/file-utils";
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
  Pencil,
} from "lucide-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("CompanyView");
  
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
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white dark:bg-slate-950 shadow-2xl border-none">
        <DialogHeader className="px-6 py-6 border-b border-gray-100 dark:border-slate-900/50 bg-gray-50/50 dark:bg-slate-900/20">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900 dark:text-gray-100">
                <Building2 className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                {t("title")}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                 {t("description")}
                <div>
                  
                </div>
              </DialogDescription>
            </div>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                onClick={() => {
                  onClose();
                  onEdit(company);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="p-0">
            <Tabs defaultValue="details" className="w-full">
            <div className="px-6 pt-4">
               <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 dark:bg-slate-900/50 p-1 rounded-xl">
                 <TabsTrigger
                  value="details"
                  className="rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                 >
                   {t("tabs.details")}
                 </TabsTrigger>
                  <TabsTrigger
                  value="contacts"
                  className="rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                 >
                   {t("tabs.contacts")}
                 </TabsTrigger>
                  <TabsTrigger
                  value="address"
                  className="rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                 >
                   {t("tabs.address")}
                 </TabsTrigger>
               </TabsList>
            </div>

            <div className="p-6 h-[450px] overflow-y-auto custom-scrollbar">
                <TabsContent value="details" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-4 mb-6">
                        <Avatar className="h-16 w-16">
                        <AvatarImage
                            src={getFileUrl(company.photo)}
                            alt={company.businessName}
                            className="h-16 w-16 rounded-lg object-contain"
                        />
                        <AvatarFallback className="rounded-full text-lg font-semibold text-slate-900">
                            {company.businessName?.charAt(0)?.toUpperCase() ?? "E"}
                        </AvatarFallback>
                        </Avatar>
                        <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {company.businessName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{company.taxName}</p>
                        </div>
                    </div>

                     <Section icon={ShieldCheck} title={t("sections.generalInfo")}>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                             {[
                                { label: t("fields.code"), value: company.cod, icon: Hash },
                                { label: t("fields.nif"), value: company.nif, icon: Tag },
                                {
                                label: t("fields.foundationDate"),
                                value: formatDate(company.hasExistedSince),
                                icon: CalendarCheck,
                                },
                            ].map((item) => (
                                <div
                                key={item.label}
                                className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/30 p-2 rounded-lg border border-slate-100 dark:border-slate-800"
                                >
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-slate-800 shadow-sm">
                                    <item.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    {item.label}
                                    </span>
                                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    {item.value || "-"}
                                    </span>
                                </div>
                                </div>
                            ))}
                        </div>
                     </Section>
                </TabsContent>

                 <TabsContent value="contacts" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                     <Section icon={Phone} title={t("sections.contact")}>
                        {hasContact ? (
                          <div className="space-y-3 text-sm">
                             {phoneNumbers.map((phone) => (
                                <div
                                    key={phone.phone}
                                    className="flex items-center gap-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-2 shadow-sm"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/20">
                                    <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <span className="text-base font-medium text-slate-900 dark:text-white">
                                    {phone.phone}
                                    </span>
                                </div>
                                ))}
                                {contact?.email && (
                                <div className="flex items-center gap-3 rounded-md bg-slate-50 dark:bg-slate-900/30 p-2 border border-slate-100 dark:border-slate-800">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-slate-800 shadow-sm">
                                    <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <span className="text-base font-medium text-slate-900 dark:text-white">
                                    {contact.email}
                                    </span>
                                </div>
                                )}
                          </div>
                        ) : (
                             <div className="text-sm text-slate-500 italic">
                                {t("messages.noContact")}
                             </div>
                        )}
                     </Section>
                 </TabsContent>

                 <TabsContent value="address" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                      <Section icon={MapPin} title={t("sections.address")}>
                         {hasAddress ? (
                            <div className="space-y-3 rounded-md bg-slate-50 dark:bg-slate-900/30 p-4 text-sm border border-slate-100 dark:border-slate-800">
                                <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-slate-800 shadow-sm">
                                    <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div className="flex-1 space-y-2 text-slate-900 dark:text-white">
                                    {address?.houseHold && (
                                    <p className="text-base font-semibold">
                                        {address.houseHold}
                                    </p>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    {address?.municipality && (
                                        <span>{t("fields.municipality")}: {address.municipality}</span>
                                    )}
                                    {address?.commune && (
                                        <span>{t("fields.commune")}: {address.commune}</span>
                                    )}
                                    {address?.province && (
                                        <span>{t("fields.province")}: {address.province}</span>
                                    )}
                                    {address?.country && <span>{t("fields.country")}: {address.country}</span>}
                                    </div>
                                </div>
                                </div>
                            </div>
                         ) : (
                             <div className="text-sm text-slate-500 italic">
                                 {t("messages.noAddress")}
                             </div>
                         )}
                      </Section>
                 </TabsContent>
            </div>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
      </div>
      <div>{children}</div>
    </div>
  )
}
