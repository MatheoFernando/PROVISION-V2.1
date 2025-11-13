"use client";

import { useState } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useCustomers } from "@/infrastructure/hooks/useCustomers";
import { Customer } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { CustomersView } from "./customers-view";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useDeleteCustomer } from "@/infrastructure/hooks/useCustomers";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CustomersCreateForm } from "./customer-create";

const columns: ColumnDef<Customer>[] = [
 
  {
    accessorKey: "cod",
    header: "Código",
    size: 50, 
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
    size: 60,
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

export function CustomersTable() {
  const { data: customers = [], isLoading } = useCustomers();
  const deleteCustomer = useDeleteCustomer();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCreateOpen(false);
    setIsDeleteOpen(false);
    setIsViewOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewOpen(false);
    setIsDeleteOpen(false);
    setIsCreateOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCreateOpen(false);
    setIsViewOpen(false);
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
      <DataTableGeneric
        columns={columns}
        data={customers}
        isLoading={isLoading}
         actionButton={{
          label: "Novo Cliente",
          onClick: () => {
            setSelectedCustomer(undefined);
            setIsCreateOpen(true);
          },
        }}
        searchKey="name"
        placeholder="Pesquisar..."
        dateKey="createdAt"
        enableRowSelection={true}
        includeSelection={true}
        rowActions={[
          {
            label: "Visualizar",
            icon: <Eye className="h-4 w-4 mr-2" />,
           onClick: (customer) => handleView(customer),
          },
          {
            label: "Editar",
            icon: <Edit className="h-4 w-4 mr-2" />,
            onClick: (customer) => handleEdit(customer),
          },
          {
            label: "Excluir",
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            onClick: (customer) => handleDelete(customer),
          },
        ]}
      />

      <Drawer
        open={isCreateOpen}
        direction="right"
        onOpenChange={(next) => {
          setIsCreateOpen(next);
          if (!next) setSelectedCustomer(undefined);
        }}
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
                customer={selectedCustomer}
                onSuccess={() => {
                  setIsCreateOpen(false);
                  setSelectedCustomer(undefined);
                }}
                onCancel={() => {
                  setIsCreateOpen(false);
                  setSelectedCustomer(undefined);
                }}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <CustomersView
        customer={selectedCustomer}
        address={selectedCustomer?.address}
        contact={selectedCustomer?.contact}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCustomer(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        isLoading={deleteCustomer.isPending}
      />
    </div>
  );
}
