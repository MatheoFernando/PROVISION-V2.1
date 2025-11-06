"use client";

import { useMemo, useState } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useEmployees } from "@/infrastructure/hooks/useEmployees";
import { Employee } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EmployeesView } from "./employees-view";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useDeleteEmployee } from "@/infrastructure/hooks/useEmployees";
import { toast } from "sonner";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useDepartments } from "@/infrastructure/hooks/useDepartments";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EmployeesCreatePage from "./employee-create";


export function EmployeesTable() {
  const companyId = useAuthStore((state) => state.companyId) ?? "";
  const { data: employees = [], isLoading } = useEmployees(companyId);
  const { data: departments = [] } = useDepartments();
  const deleteEmployee = useDeleteEmployee();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();

  const departmentIdToName = useMemo(() => {
    return Object.fromEntries(
      (departments ?? []).map((department) => [department.id, department.name])
    ) as Record<string, string>;
  }, [departments]);

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "cod",
      size: 50,
      header: "Código",
      cell: ({ row }) => {
        const cod = row.getValue("cod") as string;
        return <div className="text-sm text-muted-foreground font-medium">{cod}</div>;
      },
    },
    {
      accessorKey: "fullName",
      header: "Nome Completo",
      cell: ({ row }) => {
        const fullName = row.getValue("fullName") as string;
        return <div>{fullName}</div>;
      },
    },
    {
      accessorKey: "contactId",
      header: "Contato",
      size: 90,
      cell: ({ row }) => {
        const contactId = row.getValue("contactId") as string;
        return <div>{contactId}</div>;
      },
    },
    {
      accessorKey: "siteId",
      header: "Site",
      cell: ({ row }) => {
        const siteId = row.getValue("siteId") as string;
        return <div>{siteId ?? "Sem site"}</div>;
      },
    },
    {
      accessorKey: "departmentId",
      header: "Departamento",
      cell: ({ row }) => {
        const departmentId = row.getValue("departmentId") as string;
        const departmentName = departmentIdToName[departmentId] ?? "Não informado";
        return <div>{departmentName}</div>;
      },
    },
    {
      accessorKey: "function",
      header: "Função",
      cell: ({ row }) => {
        const functionValue = row.getValue("function") as string;
        return <div>{functionValue}</div>;
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

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsCreateOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployee || !selectedEmployee.id) return;

    try {
      await deleteEmployee.mutateAsync(selectedEmployee.id as string);
      toast.success("Funcionário excluído com sucesso!");
      setIsDeleteOpen(false);
      setSelectedEmployee(undefined);
    } catch (error) {
      toast.error("Erro ao excluir funcionário");
    }
  };


  return (
    <div className="space-y-4">
      <DataTableGeneric
        columns={columns}
        data={employees}
        isLoading={isLoading}
        searchKey="fullName"
        actionButton={{
          label: "Novo Funcionário",
          onClick: () => {
            setSelectedEmployee(undefined);
            setIsCreateOpen(true);
          },
        }}
        enableRowSelection={true}
        includeSelection={true}
        dateKey="createdAt"
        rowActions={[
          {
            label: "Visualizar",
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (employee) => handleView(employee),
          },
          {
            label: "Editar",
            icon: <Edit className="h-4 w-4 mr-2" />,
            onClick: (employee) => handleEdit(employee),
          },
          {
            label: "Excluir",
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            onClick: (employee) => handleDelete(employee),
          },
        ]}
      />

      <EmployeesView
        employee={selectedEmployee}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <EmployeesCreatePage
            id={selectedEmployee?.id}
            initialData={selectedEmployee as any}
            onSuccess={() => { setIsCreateOpen(false); setSelectedEmployee(undefined); }}
            onCancel={() => { setIsCreateOpen(false); setSelectedEmployee(undefined); }}
          />
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedEmployee(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Funcionário"
        isLoading={deleteEmployee.isPending}
        message={`Tem certeza que deseja excluir este funcionário ${selectedEmployee?.fullName ?? "Não informado"})? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
