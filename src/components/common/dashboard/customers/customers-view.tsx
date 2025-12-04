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
        <DrawerHeader className="px-6 py-4 border-b border-gray-100">
          <DrawerTitle className="text-xl font-semibold text-gray-900">
            Detalhes do Cliente
          </DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden p-0">
          <Tabs defaultValue={defaultTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-12 sticky top-0 bg-white border-b border-gray-100 rounded-none gap-0 p-0">
              <TabsTrigger 
                value="basic" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-gray-900 text-gray-600 font-medium transition-colors"
              >
                <Info className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Básico</span>
              </TabsTrigger>
              {hasCompany && (
                <TabsTrigger 
                  value="company" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 text-gray-600 font-medium transition-colors"
                >
                  <Building className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Empresa</span>
                </TabsTrigger>
              )}
              {hasAddress && (
                <TabsTrigger 
                  value="address" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 text-gray-600 font-medium transition-colors"
                >
                  <MapPin className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Endereço</span>
                </TabsTrigger>
              )}
              {hasContact && (
                <TabsTrigger 
                  value="contact" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 text-gray-600 font-medium transition-colors"
                >
                  <Phone className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Contato</span>
                </TabsTrigger>
              )}
              {hasSites && (
                <TabsTrigger 
                  value="sites" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 text-gray-600 font-medium transition-colors"
                >
                  <Building2 className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Sites</span>
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <TabsContent value="basic" className="mt-0 p-0 space-y-3">
                <div className="space-y-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{customer.cod}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{customer.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome Fiscal</label>
                    <p className="text-sm text-gray-900 mt-1">{customer.taxName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">NIF</label>
                    <p className="text-sm font-mono text-gray-900 mt-1">{customer.nif}</p>
                  </div>
                </div>
              </TabsContent>

              {hasCompany && (
                <TabsContent value="company" className="mt-0 p-0 space-y-3">
                  <div className="space-y-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{company.cod}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome Comercial</label>
                    <p className="text-sm text-gray-900 mt-1">{company.businessName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome Fiscal</label>
                    <p className="text-sm text-gray-900 mt-1">{company.taxName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">NIF</label>
                    <p className="text-sm font-mono text-gray-900 mt-1">{company.nif}</p>
                  </div>
                  </div>
                </TabsContent>
              )}

              {hasAddress && (
                <TabsContent value="address" className="mt-0 p-0 space-y-3">
                  <div className="space-y-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Domicílio</label>
                    <p className="text-sm text-gray-900 mt-1">{address.houseHold}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Comuna</label>
                    <p className="text-sm text-gray-900 mt-1">{address.commune}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Município</label>
                    <p className="text-sm text-gray-900 mt-1">{address.municipality}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Província</label>
                    <p className="text-sm text-gray-900 mt-1">{address.province}</p>
                  </div>
                  {address.country && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">País</label>
                      <p className="text-sm text-gray-900 mt-1">{address.country}</p>
                    </div>
                  )}
                  </div>
                </TabsContent>
              )}

              {hasContact && (
                <TabsContent value="contact" className="mt-0 p-0 space-y-2 grid grid-cols-2 gap-3">
                  {phoneNumbers.map((p) => (
                    <div key={p.phone} className="flex items-center gap-3 p-3 border border-gray-200 hover:border-gray-300 transition-colors">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-900">{p.phone}</p>
                    </div>
                  ))}
                  {contact.email && (
                    <div className="flex items-center gap-3 p-3 border border-gray-200 hover:border-gray-300 transition-colors">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-900 truncate">{contact.email}</p>
                    </div>
                  )}
                </TabsContent>
              )}

              {hasSites && (
                <TabsContent value="sites" className="mt-0 p-0 grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    {sites.map((site) => (
                      <div key={site.id} className="p-3 border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-medium text-gray-900 text-sm">{site.name}</h3>
                          <span className="text-xs text-gray-500 flex-shrink-0">{site.cod}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-500">Trabalhadores</span>
                          <span className="text-sm font-medium text-gray-900">{site.numberWorkersContract}</span>
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