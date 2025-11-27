import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, User, MapPin, Phone, Mail, Info, Building, Building2 } from "lucide-react";
import { Address, Contact, Customer, Company, Site } from "@/infrastructure/types/domain";

interface CustomersViewProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer & {
    company?: Company | null;
    address?: Address | null;
    contact?: Contact | null;
    sites?: Site[] | (Site | null)[] | null;
    addresses?: Address | (Address | null)[] | null;
    contacts?: Contact | (Contact | null)[] | null;
  };
}

export function CustomersView({ isOpen, onClose, customer }: CustomersViewProps) {
  if (!customer) return null;

  const company = customer.company ?? null;
  const address =
    customer.address ??
    (Array.isArray(customer.addresses)
      ? (customer.addresses.find((item): item is Address => Boolean(item)) ?? null)
      : customer.addresses ?? null);
  const contact =
    customer.contact ??
    (Array.isArray(customer.contacts)
      ? (customer.contacts.find((item): item is Contact => Boolean(item)) ?? null)
      : customer.contacts ?? null);
  const sites = Array.isArray(customer.sites)
    ? (customer.sites.filter((site): site is Site => Boolean(site)) as Site[])
    : [];
  const phoneNumbers = contact?.phoneNumbers ?? [];

  const defaultTab = "basic";
  const hasCompany = !!company;
  const hasAddress = !!address;
  const hasContact = !!contact && (phoneNumbers.length > 0 || !!contact.email);
  const hasSites = sites.length > 0;

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right" modal={true}>
      <DrawerContent className="h-auto max-w-md flex flex-col max-h-screen bg-white">
        <DrawerHeader className="px-6 py-6 flex-shrink-0">
          <DrawerTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            Detalhes do Cliente
          </DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8 rounded-full hover:bg-white/20 transition-colors "
            >
              <X className="w-4 h-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden p-0">
          <Tabs defaultValue={defaultTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-14 sticky top-0 bg-white border-b border-slate-200 rounded-none gap-0">
              <TabsTrigger 
                value="basic" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-slate-400 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-cyan-600 text-slate-600 font-medium transition-all"
              >
                <Info className="w-4 h-4 mr-1" />
                Básico
              </TabsTrigger>
              {hasCompany && (
                <TabsTrigger 
                  value="company" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent data-[state=active]:text-cyan-600 text-slate-600 font-medium transition-all cursor-pointer"
                >
                  <Building className="w-4 h-4 mr-1" />
                  Empresa
                </TabsTrigger>
              )}
              {hasAddress && (
                <TabsTrigger 
                  value="address" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-slate-400 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-cyan-600 text-slate-600 font-medium transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Endereço
                </TabsTrigger>
              )}
              {hasContact && (
                <TabsTrigger 
                  value="contact" 
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-slate-400 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-cyan-600 text-slate-600 font-medium transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Contato
                </TabsTrigger>
              )}
              {hasSites && (
                <TabsTrigger 
                  value="sites" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent data-[state=active]:text-cyan-600 text-slate-600 font-medium transition-all"
                >
                  <Building2 className="w-4 h-4 mr-1" />
                  Sites ({sites.length})
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 ">
              <TabsContent value="basic" className="mt-0 p-0">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Código</span>
                      <p className="text-lg font-bold text-slate-900 mt-2">{customer.cod}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</span>
                      <p className="text-lg font-bold text-slate-900 mt-2">{customer.name}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow col-span-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome Fiscal</span>
                      <p className="text-sm font-semibold text-slate-900 mt-2">{customer.taxName}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow col-span-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">NIF</span>
                      <p className="text-sm font-mono font-semibold text-slate-900 mt-2">{customer.nif}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {hasCompany && (
                <TabsContent value="company" className="mt-0 p-0">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Código</span>
                        <p className="text-lg font-bold text-slate-900 mt-2">{company.cod}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome Comercial</span>
                        <p className="text-sm font-semibold text-slate-900 mt-2">{company.businessName}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow col-span-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome Fiscal</span>
                        <p className="text-sm font-semibold text-slate-900 mt-2">{company.taxName}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow col-span-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">NIF</span>
                        <p className="text-sm font-mono font-semibold text-slate-900 mt-2">{company.nif}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              {hasAddress && (
                <TabsContent value="address" className="mt-0 p-0">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Domicílio</span>
                        <p className="text-sm font-medium text-slate-900 mt-2">{address.houseHold}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Comuna</span>
                        <p className="text-sm font-medium text-slate-900 mt-2">{address.commune}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Município</span>
                        <p className="text-sm font-medium text-slate-900 mt-2">{address.municipality}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Província</span>
                        <p className="text-sm font-medium text-slate-900 mt-2">{address.province}</p>
                      </div>
                      {address.country && (
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow col-span-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">País</span>
                          <p className="text-sm font-medium text-slate-900 mt-2">{address.country}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}

              {hasContact && (
                <TabsContent value="contact" className="mt-0 p-0">
                  <div className="space-y-2">
                    {phoneNumbers.map((p) => (
                      <div key={p.phone} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
                        <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 font-semibold text-sm">{p.phone}</p>
                        </div>
                      </div>
                    ))}
                    {contact.email && (
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
                        <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 font-semibold text-sm truncate">{contact.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {hasSites && (
                <TabsContent value="sites" className="mt-0 p-0">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {sites.map((site) => (
                      <div key={site.id} className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-slate-900">{site.name}</h3>
                          <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full">
                            Cód: {site.cod}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500">Nº Trabalhadores</span>
                          <span className="font-bold text-slate-900">{site.numberWorkersContract}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}