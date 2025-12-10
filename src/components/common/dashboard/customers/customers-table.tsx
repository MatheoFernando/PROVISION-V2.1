"use client";

import { useState } from "react";
import { Eye, PencilSimple, Trash, X } from "phosphor-react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { BulkImportDialog } from "@/components/common/base-ui/bulk-import";
import {
  useCreateGrossCustomer,
  useDeleteCustomer,
  useCustomersByCompanyId,
  useCustomers,
} from "@/infrastructure/hooks/useCustomers";
import { useSites } from "@/infrastructure/hooks/useSites";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { Customer, Company, Contact } from "@/infrastructure/types/domain";
import { type CreateGrossCustomerPayload } from "@/infrastructure/schema/schema-customers";
import { DeleteModal } from "@/components/ui/delete-modal";
import { CustomerDialog } from "./customer-create";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "cod",
    header: "Código",
    cell: ({ row }) => {
      const cod = row.getValue("cod") as string;
      return <div>{cod}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div>{name}</div>;
    },
  },
  {
    accessorKey: "taxName",
    header: "Nome Fiscal",
    cell: ({ row }) => {
      const taxName = row.getValue("taxName") as string;
      return <div>{taxName}</div>;
    },
  },
  {
    accessorKey: "nif",
    header: "NIF",
    cell: ({ row }) => {
      const nif = row.getValue("nif") as string;
      return <div>{nif}</div>;
    },
  },
  {
    accessorKey: "contact",
    header: "Contacto",
    cell: ({ row }) => {
      const contact = row.getValue("contact") as Contact;
      const phone = contact?.phoneNumbers?.[0]?.phone || "";

      if (!phone) return <div className="text-muted-foreground">-</div>;

      return (
        <div className="flex flex-col">
          {phone && <span className="text-xs text-muted-foreground">{phone}</span>}
        </div>
      );
    },
  }
];

interface CustomersTableProps {
  openCreateOnLoad?: boolean;
  shouldNavigateBack?: boolean;
}

type TableData = Customer;

export function CustomersTable({
  openCreateOnLoad = false,
  shouldNavigateBack = false,
}: CustomersTableProps = {}) {
  const router = useRouter();
  const companyId = useAuthStore((state) => state.companyId) || "";

  const {
    data: customersByCompany = [],
    isLoading: isLoadingByCompany,
  } = useCustomersByCompanyId(companyId, {
    enabled: !!companyId,
  });

  const {
    data: allCustomers = [],
    isLoading: isLoadingAll,
  } = useCustomers();

  const customers = companyId ? customersByCompany : allCustomers;
  const isLoadingCustomers = companyId ? isLoadingByCompany : isLoadingAll;

  const deleteCustomer = useDeleteCustomer();
  const createGrossCustomer = useCreateGrossCustomer();
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(openCreateOnLoad);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | Company | undefined
  >();


  const selectedCustomerId =
    (selectedCustomer as Customer | Company | undefined)?.id;



  const data = customers;
  const isLoading = isLoadingCustomers;
  const tableColumns = customerColumns;
  const searchKey = "businessName";

  const resetCreateState = () => {
    setIsCreateOpen(false);
    setSelectedCustomer(undefined);
  };

  const handleReturn = () => {
    if (shouldNavigateBack) router.back();
  };

  const handleCreateCancel = () => {
    resetCreateState();
    handleReturn();
  };



  const handleCreateDialogChange = (open: boolean) => {
    if (open) {
      setIsCreateOpen(true);
      return;
    }
    handleCreateCancel();
  };

  const handleView = (customer: Customer | Company) => {
    if (!customer?.id) return;
    router.push(`/dashboard/clientes/${customer.id}`);
  };


  const handleEdit = (customer: Customer | Company) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(false);
    setIsCreateOpen(true);
  };

  const handleDelete = (customer: Customer | Company) => {
    setSelectedCustomer(customer);
    setIsCreateOpen(false);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;

    try {
      await deleteCustomer.mutateAsync(selectedCustomer.id as string);
      toast.success("Cliente excluído com sucesso!");
      setIsDeleteOpen(false);
      setSelectedCustomer(undefined);
    } catch (error) {
      toast.error("Erro ao excluir cliente");
    }
  };

  const { data: allSites = [] } = useSites(undefined, {
    enabled: true,
  });

  const customersWithSites = new Set(
    allSites.map((site) => site.customerId).filter(Boolean)
  );

  return (
    <div className="space-y-4">
      <DataTableGeneric<TableData, any>
        columns={tableColumns as ColumnDef<TableData>[]}
        data={data as TableData[]}
        isLoading={isLoading}
        actionButton={{
          label: "Novo Cliente",
          onClick: () => {
            setSelectedCustomer(undefined);
            setIsCreateOpen(true);
          }

        }}
        bulkImportButton={{
          label: "Importar clientes",
          onClick: () => setIsBulkOpen(true),
        }}
        searchKey={searchKey as any}
        placeholder="Pesquisar..."
        dateKey="createdAt"
        rowActions={[
          {
            label: "Visualizar",
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (customer) => handleView(customer),
          },
          {
            label: "Editar",
            icon: <PencilSimple className="h-4 w-4 mr-2" />,
            onClick: (customer) => handleEdit(customer),
          },
          {
            label: "Excluir",
            icon: <Trash className="h-4 w-4 mr-2" />,
            onClick: (customer) => handleDelete(customer),
            render: (customer, action) => {
              const hasSites = customersWithSites.has(customer.id as string);
              return (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* Wrap in span to ensure Tooltip works even if DropdownMenuItem is disabled-ish */}
                      <span tabIndex={0} className="w-full outline-none">
                        <DropdownMenuItem
                          className={`w-full cursor-pointer ${hasSites ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          onClick={(e) => {
                            if (hasSites) {
                              e.preventDefault();
                              e.stopPropagation();
                            } else {
                              action.onClick(customer);
                            }
                          }}
                        >
                          {action.icon && <span className="mr-2">{action.icon}</span>}
                          {action.label}
                        </DropdownMenuItem>
                      </span>
                    </TooltipTrigger>
                    {hasSites && (
                      <TooltipContent>
                        <p>Não pode excluir cliente com sites associados</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            },
          },

        ]}
      />

      <CustomerDialog
        open={isCreateOpen}
        onOpenChange={handleCreateDialogChange}
        customerToEdit={selectedCustomer as Customer | undefined}
      />



      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCustomer(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Empresa"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        isLoading={deleteCustomer.isPending}
      />

      <BulkImportDialog<CreateGrossCustomerPayload>
        isOpen={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        title="Importação em massa de clientes"
        columns={[
          { key: "cod", label: "Código", required: true },
          { key: "name", label: "Nome", required: true },
          { key: "taxName", label: "Nome Fiscal", required: true },
          { key: "nif", label: "NIF", required: true },
          { key: "contactEmail", label: "Email", required: false },
          { key: "contactPhones", label: "Telefone", required: false },
          { key: "addressHouseHold", label: "Morada", required: true },
          { key: "addressCommune", label: "Comuna", required: true },
          { key: "addressMunicipality", label: "Município", required: true },
          { key: "addressProvince", label: "Província", required: true },
          { key: "addressCountry", label: "País", required: true },
        ]}
        templateFilename="modelo-clientes.csv"
        mapRawToInput={(raw) => {
          const phoneNumbers = (raw.contactPhones ?? "")
            .split(/[;,]/)
            .map((phone) => phone.trim())
            .filter((phone) => phone.length > 0)
            .map((phone) => ({ phone }));

          const baseCustomerData = {
            cod: raw.cod ?? "",
            name: raw.name ?? "",
            taxName: raw.taxName ?? "",
            nif: raw.nif ?? "",
            companyId,
          };

          return {
            ...baseCustomerData,
            customer: {
              ...baseCustomerData,
              photo: "",
            },
            contact: {
              email: raw.contactEmail || undefined,
              phoneNumbers,
              companyId,
            },
            address: {
              houseHold: raw.addressHouseHold ?? "",
              commune: raw.addressCommune ?? "",
              municipality: raw.addressMunicipality ?? "",
              province: raw.addressProvince ?? "",
              country: raw.addressCountry ?? "",
              companyId,
            },
          };
        }}
        onCreate={async (payload) => {
          await createGrossCustomer.mutateAsync(payload);
        }}
      />
    </div>
  );
}
