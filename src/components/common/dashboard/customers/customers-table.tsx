"use client";

import { useState } from "react";
import { Eye, MapPinLine, PencilSimple, Trash, X } from "phosphor-react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { BulkImportDialog } from "@/components/common/base-ui/bulk-import";
import {
  useCreateGrossCustomer,
  useDeleteCustomer,
  useCustomersByCompanyId,
} from "@/infrastructure/hooks/useCustomers";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { Customer, Company } from "@/infrastructure/types/domain";
import { type CreateGrossCustomerPayload } from "@/infrastructure/schema/schema-customers";
import { DeleteModal } from "@/components/ui/delete-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CustomersCreateForm } from "./customer-create";
import { CustomersView } from "./customers-view";
import { useSitesByCompanyAndCustomer } from "@/infrastructure/hooks/useSites";
import { SitesTable } from "../sites/sites-table";

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
];

interface CustomersTableProps {
  openCreateOnLoad?: boolean;
  shouldNavigateBack?: boolean;
}

type TableData = Customer | Company;

export function CustomersTable({
  openCreateOnLoad = false,
  shouldNavigateBack = false,
}: CustomersTableProps = {}) {
  const router = useRouter();
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin);
  const companyId = useAuthStore((state) => state.companyId) || "";

  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
  } = useCustomersByCompanyId(companyId, {
    enabled: !isGlobalAdmin && !!companyId,
  });

  const deleteCustomer = useDeleteCustomer();
  const createGrossCustomer = useCreateGrossCustomer();
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(openCreateOnLoad);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | Company | undefined
  >();
  const [isSitesOpen, setIsSitesOpen] = useState(false);
  const [selectedCustomerForSites, setSelectedCustomerForSites] = useState<
    Customer | Company | undefined
  >();

  const selectedCustomerId =
    (selectedCustomer as Customer | Company | undefined)?.id;

  const { data: customerSites = [] } = useSitesByCompanyAndCustomer(
    companyId,
    selectedCustomerId,
    {
      enabled: isViewOpen && !!companyId && !!selectedCustomerId,
    },
  );

  const customerForView = ((): Customer | undefined => {
    if (!selectedCustomer) return undefined;
    const base = selectedCustomer as Customer;
    return {
      ...base,
      sites: customerSites,
    } as Customer;
  })();

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

  const handleCreateSuccess = () => {
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
    setSelectedCustomer(customer);
    setIsViewOpen(true);
  };

  const handleViewSites = (customer: Customer | Company) => {
    if (!customer?.id) return;
    setSelectedCustomerForSites(customer);
    setIsSitesOpen(true);
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

  return (
    <div className="space-y-4">
      <DataTableGeneric<TableData, any>
        columns={tableColumns as ColumnDef<TableData>[]}
        data={data as TableData[]}
        isLoading={isLoading}
        actionButton={{
          label: "Novo Cliente",
          onClick: () => {
            if (isGlobalAdmin) {
              router.push("/dashboard/companies/create");
              return;
            }
            setSelectedCustomer(undefined);
            setIsCreateOpen(true);
          },
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
            label: "Ver sites",
            icon: <MapPinLine className="h-4 w-4 mr-2" />,
            onClick: (customer) => handleViewSites(customer),
          },
          {
            label: "Excluir",
            icon: <Trash className="h-4 w-4 mr-2" />,
            onClick: (customer) => handleDelete(customer),
          },

        ]}
      />

      <CustomersView
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
        }}
        customer={customerForView}
      />

      <Drawer
        open={isCreateOpen}
        direction="right"
        onOpenChange={handleCreateDialogChange}
      >
        <DrawerContent className="h-full w-full sm:max-w-xl">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DrawerTitle className="text-2xl font-bold text-foreground">
                    {selectedCustomer ? "Editar Cliente" : "Novo Cliente"}
                  </DrawerTitle>
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <CustomersCreateForm
                customer={selectedCustomer as Customer | undefined}
                onSuccess={handleCreateSuccess}
                onCancel={handleCreateCancel}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={isSitesOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsSitesOpen(false);
            setSelectedCustomerForSites(undefined);
          }
        }}
      >
        <DialogContent className="sm:max-w-7xl">
          <DialogHeader>
            <DialogTitle>
              Sites do {(selectedCustomerForSites as any)?.name || "Cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto">
            {selectedCustomerForSites?.id && (
              <SitesTable
                customerId={selectedCustomerForSites.id}
                shouldNavigateBack={false}
              />
            )}
           
          </div>
        </DialogContent>
      </Dialog>


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
