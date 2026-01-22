 "use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { getFileUrl } from "@/infrastructure/utils/file-utils";
import type {
  Address,
  Company,
  Contact,
  Employee,
  Site,
  User,
  Equipment,
  Customer,
} from "@/infrastructure/types/domain";
import { useEquipment } from "@/infrastructure/hooks/useEquipment";
import { useUpdateCompanyMutation } from "@/infrastructure/hooks/useCompanies";
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
  Users,
  Eye,
  Wrench,
  Ban,
  Power,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { EmployeeDetailsView } from "@/components/common/dashboard/employees/employee-details-view";
import { SiteDetailsView } from "@/components/common/dashboard/sites/site-details-view";
import { CustomersView } from "@/components/common/dashboard/customers/customers-details-view";

type AddressWithAggregates = Address & {
  employees?: (Employee | null)[] | null;
  sites?: (Site | null)[] | null;
};

type CompanyWithRelations = Company & {
  addresses?: (AddressWithAggregates | null)[] | AddressWithAggregates | null;
  contacts?: (Contact | null)[] | Contact | null;
  employees?: (Employee | null)[] | null;
  users?: (User | null)[] | null;
  sites?: (Site | null)[] | null;
  customers?: (Customer | null)[] | null;
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
  if (data.addresses) {
    return data.addresses as Address;
  }
  return null;
};

const resolveContact = (data?: CompanyWithRelations | null): Contact | null => {
  if (!data) return null;
  if (data.contact) return data.contact;
  if (Array.isArray(data.contacts)) {
    return (
      data.contacts.find((item): item is Contact => Boolean(item)) ?? null
    );
  }
  if (data.contacts) {
    return data.contacts as Contact;
  }
  return null;
};

interface CompanyViewProps {
  open: boolean;
  onClose: () => void;
  company: CompanyWithRelations | null;
  onEdit?: (company: Company) => void;
  view?: string;
  subId?: string;
  mode?: "dialog" | "page";
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function CompanyDetailView({ view, subId }: { view: string; subId: string }) {
  if (view === "funcionarios" || view === "employees") {
    return <EmployeeDetailsView employeeId={subId} />;
  }
  if (view === "sites") {
    return <SiteDetailsView siteId={subId} />;
  }
  if (view === "clientes" || view === "customers") {
    return <CustomersView customerId={subId} />;
  }
  return null;
}

export function CompanyView({
  open,
  onClose,
  company,
  onEdit,
  view,
  subId,
  mode,
}: CompanyViewProps) {
  const t = useTranslations("CompanyView");
  const router = useRouter();
  const { mutateAsync: updateCompany } = useUpdateCompanyMutation({ showToast: false });

  const [activeSummary, setActiveSummary] = React.useState<
    "employees" | "users" | "equipment" | "customers" | "sites" | null
  >("users");

  const employeeColumns = React.useMemo<ColumnDef<Employee>[]>(() => [
    { accessorKey: "cod", header: "Código" },
    { accessorKey: "fullName", header: "Nome" },
    { accessorKey: "function", header: "Função" },
    {
      accessorKey: "contact.email",
      header: "Email",
      cell: ({ row }) => row.original.contact?.email ?? "-",
    },
  ], []);

  const companySlug = React.useMemo(() => {
    if (!company?.businessName) return null;
    return slugify(company.businessName);
  }, [company?.businessName]);

  const handleToggleStatus = async () => {
    if (!company?.id) return;
    try {
      await updateCompany({
        id: company.id,
        businessName: company.businessName,
        taxName: company.taxName,
        status: !company.status,
      });
      toast.success(
        !company.status
          ? "Empresa ativada com sucesso"
          : "Empresa desativada com sucesso"
      );
    } catch (error) {
       console.error("Failed to toggle status", error);
       toast.error("Erro ao alterar estado da empresa");
    }
  };

  const employeeRowActions = React.useMemo(
    () => [
      {
        label: "Ver",
        icon: <Eye className="h-4 w-4 mr-2" />,
        onClick: (employee: Employee) => {
          if (!employee.id) return;
          if (companySlug) {
            router.push(`/dashboard/empresa/${companySlug}/funcionarios/${employee.id}`);
          } else {
            router.push(`/dashboard/funcionarios/${employee.id}`);
          }
        },
      },
    ],
    [router, companySlug],
  );



    const siteColumns = React.useMemo<ColumnDef<Site>[]>(() => [
    { accessorKey: "cod", header: "Código" },
    { accessorKey: "name", header: "Nome" },
    {
      accessorKey: "numberWorkersContract",
      header: "Trabalhadores",
    },
  ], []);

  const siteRowActions = React.useMemo(
    () => [
      {
        label: "Ver",
        icon: <Eye className="h-4 w-4 mr-2" />,
        onClick: (site: Site) => {
          if (!site.id) return;
          if (companySlug) {
            router.push(`/dashboard/empresa/${companySlug}/sites/${site.id}`);
          } else {
            router.push(`/dashboard/sites/${site.id}`);
          }
        },
      },
    ],
    [router, companySlug],
  );

  const customerColumns = React.useMemo<ColumnDef<Customer>[]>(() => [
    { accessorKey: "cod", header: "Código" },
    { accessorKey: "name", header: "Nome" },
    { accessorKey: "taxName", header: "Nome Fiscal" },
    { accessorKey: "nif", header: "NIF" },
  ], []);

  const customerRowActions = React.useMemo(
    () => [
      {
        label: "Ver",
        icon: <Eye className="h-4 w-4 mr-2" />,
        onClick: (customer: Customer) => {
          if (!customer.id) return;
          if (companySlug) {
            router.push(`/dashboard/empresa/${companySlug}/clientes/${customer.id}`);
          } else {
            router.push(`/dashboard/clientes/${customer.id}`);
          }
        },
      },
    ],
    [router, companySlug],
  );

  const userColumns = React.useMemo<ColumnDef<User>[]>(() => [
    { accessorKey: "phone", header: "Telefone" },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={row.original.status ? "text-emerald-600" : "text-rose-500"}>
          {row.original.status ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      accessorKey: "isGlobalAdmin",
      header: "Perfil",
      cell: ({ row }) =>
        row.original.isGlobalAdmin ? "Administrador" : "Utilizador",
    },
  ], []);

  const { data: equipmentData = [], isLoading: isLoadingEquipment } = useEquipment(
    undefined,
    {
      companyId: company?.id,
      enabled: !!company?.id,
    }
  );

  const equipmentColumns = React.useMemo<ColumnDef<Equipment>[]>(() => [
    { accessorKey: "cod", header: "Código" },
    { accessorKey: "serialNumber", header: "Número de Série" },
    { accessorKey: "mark", header: "Marca" },
    { accessorKey: "model", header: "Modelo" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const isActive = status === true || status === "ACTIVE" || String(status).toUpperCase() === "ACTIVE";
        return (
          <span className={isActive ? "text-emerald-600" : "text-rose-500"}>
            {isActive ? "Ativo" : "Inativo"}
          </span>
        );
      },
    },
    {
      accessorKey: "site",
      header: "Site",
      cell: ({ row }) => row.original.site?.name ?? "-",
    },
    {
      accessorKey: "typeEquipment",
      header: "Tipo",
      cell: ({ row }) => row.original.typeEquipment?.name ?? "-",
    },
  ], []);

  if (!company) return null;

  if (view && subId) {
    return <CompanyDetailView view={view} subId={subId} />;
  }


  const address = resolveAddress(company);
  const contact = resolveContact(company);
  const phoneNumbers = Array.isArray(contact?.phoneNumbers)
    ? contact?.phoneNumbers
    : [];
  const hasAddress =
    !!address &&
    !!(
      address.houseHold ||
      address.commune ||
      address.municipality ||
      address.province ||
      address.country
    );

  const employees =
    company.employees?.filter(
      (employee): employee is Employee => Boolean(employee),
    ) ?? [];

  const users =
    company.users?.filter((user): user is User => Boolean(user)) ?? [];

  const rootSites =
    company.sites?.filter((site): site is Site => Boolean(site)) ?? [];

  const addressesArray: AddressWithAggregates[] = Array.isArray(
    company.addresses,
  )
    ? company.addresses.filter(
        (item): item is AddressWithAggregates => Boolean(item),
      )
    : company.addresses
      ? [company.addresses]
      : [];

  const sitesFromAddresses =
    addressesArray.flatMap((item) => {
      const sites = item.sites ?? [];
      return sites.filter((site): site is Site => Boolean(site));
    }) ?? [];

  const sites = [...rootSites, ...sitesFromAddresses];

  const customers =
    company.customers?.filter(
      (customer): customer is Customer => Boolean(customer),
    ) ?? [];

  const content = (
      <div className="bg-white dark:bg-slate-950 min-h-screen">
        <div className="px-6 py-8 border-b border-gray-100/80 dark:border-slate-800/50 bg-gradient-to-b from-gray-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
          <div className="flex items-start justify-between gap-6 mb-6">
     <div>
             <div className="flex items-start gap-5">
              <Avatar className="h-16 w-16 rounded-2xl ring-1 ring-gray-200 dark:ring-slate-700 shadow-sm">
                <AvatarImage
                  src={getFileUrl(company.photo)}
                  alt={company.businessName}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
                <AvatarFallback className="rounded-2xl text-lg font-semibold text-slate-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-800">
                  {company.businessName?.charAt(0)?.toUpperCase() ?? "E"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-gray-50 tracking-tight">
                  {company.businessName}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {company.taxName}
                </p>
              </div>
              
            </div>
            <div>
                  {hasAddress && (
            <div className="mt-6">
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Endereço</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {address?.houseHold && (
                  <span className="text-xs text-slate-600 dark:text-slate-400">{address.houseHold}</span>
                )}
                {address?.municipality && (
                  <span className="text-xs text-slate-600 dark:text-slate-400">• {address.municipality}</span>
                )}
                {address?.commune && (
                  <span className="text-xs text-slate-600 dark:text-slate-400">• {address.commune}</span>
                )}
                {address?.province && (
                  <span className="text-xs text-slate-600 dark:text-slate-400">• {address.province}</span>
                )}
                {address?.country && (
                  <span className="text-xs text-slate-600 dark:text-slate-400">• {address.country}</span>
                )}
              </div>
            </div>
          )}
            </div>
     </div>
            <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors rounded-xl"
                onClick={() => {
                  onClose();
                  onEdit(company);
                }}
                aria-label="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
             <Button
                variant="ghost"
                className={`transition-colors rounded-xl ${
                    company.status
                    ? "text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                }`}
                onClick={handleToggleStatus}
                aria-label={company.status ? "Desativar" : "Ativar"}
              >
                {company.status ? (
                   <>
                     <Ban className="h-4 w-4" />
                     Desativar
                   </>
                ) : (
                    <>
                      <Power className="h-4 w-4" />
                      Ativar
                    </>
                )}
              </Button>
              </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
              <Hash className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{company.cod}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
              <Tag className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{company.nif}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
              <CalendarCheck className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{formatDate(company.hasExistedSince)}</span>
            </div>
            {contact?.email && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{contact.email}</span>
              </div>
            )}
          </div>

      
        </div>

        <div className="px-6 pb-8 pt-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Visão Geral</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                <SummaryCard
                label="Utilizadores"
                value={users.length}
                icon={ShieldCheck}
                isActive={activeSummary === "users"}
                onClick={() =>
                  setActiveSummary(
                    activeSummary === "users" ? null : "users",
                  )
                }
              />
              <SummaryCard
                label="Funcionários"
                value={employees.length}
                icon={Users}
                isActive={activeSummary === "employees"}
                onClick={() =>
                  setActiveSummary(
                    activeSummary === "employees" ? null : "employees",
                  )
                }
              />
          
              <SummaryCard
                label="Equipamentos"
                value={equipmentData.length}
                icon={Wrench}
                isActive={activeSummary === "equipment"}
                onClick={() =>
                  setActiveSummary(
                    activeSummary === "equipment" ? null : "equipment",
                  )
                }
              />
                <SummaryCard
                label="Clientes"
                value={customers.length}
                icon={Building2}
                isActive={activeSummary === "customers"}
                onClick={() =>
                  setActiveSummary(
                    activeSummary === "customers" ? null : "customers",
                  )
                }
              />
              <SummaryCard
                label="Sites"
                value={sites.length}
                icon={MapPin}
                isActive={activeSummary === "sites"}
                onClick={() =>
                  setActiveSummary(
                    activeSummary === "sites" ? null : "sites",
                  )
                }
              />
            
          </div>

          {activeSummary === "employees" && (
              <div className="mt-6 bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <DataTableGeneric<Employee, unknown>
                  data={employees}
                  columns={employeeColumns}
                  isLoading={false}
                  searchKey="fullName"
                  placeholder="Pesquisar funcionários..."
                  rowActions={employeeRowActions}
                  pageSize={5}
                />
              </div>
            )}

          {activeSummary === "users" && (
              <div className="mt-6 bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <DataTableGeneric<User, unknown>
                  data={users}
                  columns={userColumns}
                  isLoading={false}
                  searchKey="phone"
                  placeholder="Pesquisar utilizadores..."
                  pageSize={5}
                />
              </div>
            )}

          {activeSummary === "equipment" && (
              <div className="mt-6 bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <DataTableGeneric<Equipment, unknown>
                  data={equipmentData}
                  columns={equipmentColumns}
                  isLoading={isLoadingEquipment}
                  searchKey="cod"
                  placeholder="Pesquisar equipamentos..."
                  pageSize={5}
                />
              </div>
            )}
            {activeSummary === "sites" && (
              <div className="mt-6 bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <DataTableGeneric<Site, unknown>
                  data={sites}
                  columns={siteColumns}
                  isLoading={false}
                  searchKey="name"
                  placeholder="Pesquisar sites..."
                  pageSize={5}
                  rowActions={siteRowActions}
                />
              </div>
            )}

            {activeSummary === "customers" && (
              <div className="mt-6 bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <DataTableGeneric<Customer, unknown>
                  data={customers}
                  columns={customerColumns}
                  isLoading={false}
                  searchKey="name"
                  placeholder="Pesquisar clientes..."
                  rowActions={customerRowActions}
                  pageSize={5}
                />
              </div>
            )}

        </div>
      </div>
  );

  
  const isPage = view !== undefined || subId !== undefined || mode === 'page'; 
  
  if (isPage) {
      return content;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-white dark:bg-slate-950 shadow-2xl border-none">
         <div className="max-h-[85vh] overflow-y-auto">
            {content}
         </div>
      </DialogContent>
    </Dialog>
  );
}





interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  isActive,
  onClick,
}: SummaryCardProps) {
  const hasItems = value > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
        isActive
          ? "border-blue-500/50 bg-blue-50/80 dark:border-blue-500/50 dark:bg-blue-950/30 shadow-sm"
          : "border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-sm dark:border-slate-800/50 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/60"
      } ${!hasItems ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className="flex items-center gap-3 w-full">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
          isActive 
            ? "bg-blue-100 dark:bg-blue-900/40" 
            : "bg-gray-100 dark:bg-slate-800 group-hover:bg-gray-200 dark:group-hover:bg-slate-700"
        }`}>
          <Icon className={`h-5 w-5 ${
            isActive 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-slate-600 dark:text-slate-400"
          }`} />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className={`text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5 ${
            isActive && "text-blue-600 dark:text-blue-400"
          }`}>
            {label}
          </span>
          <span className={`text-2xl font-semibold tracking-tight ${
            isActive 
              ? "text-blue-700 dark:text-blue-300" 
              : "text-slate-900 dark:text-white"
          }`}>
            {value}
          </span>
        </div>
      </div>
    </button>
  );
}



