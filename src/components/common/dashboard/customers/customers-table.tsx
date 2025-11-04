"use client";

import { useState } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useCustomers } from "@/infrastructure/hooks/useCustomers";
import { Customer } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CustomersView } from "./customers-view";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useDeleteCustomer } from "@/infrastructure/hooks/useCustomers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const columns: ColumnDef<Customer>[] = [
 
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
    accessorKey: "createdAt",
    header: "Data de Criação",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    },
  },
];

export function CustomersTable() {
  const { data: customers = [], isLoading } = useCustomers();
  const deleteCustomer = useDeleteCustomer();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();

  const filteredData = customers.filter((item) =>
    item.cod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.taxName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nif.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleCreate = () => {
    setSelectedCustomer(undefined);
    setIsViewOpen(false);
    setIsDeleteOpen(false);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-4">
      <DataTableGeneric
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchKey="name"
        actionButton={{
          label: "Novo Cliente",
          onClick: () => router.push("/dashboard/customers/create"),
        }}
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

   

      <CustomersView
        customer={selectedCustomer}
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
