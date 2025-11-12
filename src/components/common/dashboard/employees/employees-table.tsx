"use client";

import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useEmployees } from "@/infrastructure/hooks/useEmployees";
import { Employee } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";
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
  const { mutateAsync: deleteEmployee, isPending: isDeleting } = useDeleteEmployee();
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | undefined>();
  const [employeesToDelete, setEmployeesToDelete] = React.useState<Employee[]>([]);

  const departmentIdToName = React.useMemo(() => {
    return Object.fromEntries(
      (departments ?? []).map((department) => [department.id, department.name])
    ) as Record<string, string>;
  }, [departments]);

  const columns = React.useMemo<ColumnDef<Employee>[]>(() => [
    {
      accessorKey: "cod",
      size: 50,
      header: "Nº Mec",
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
  ], [departmentIdToName]);

  const resetDeletionState = React.useCallback(() => {
    setEmployeesToDelete([]);
    setIsDeleteOpen(false);
    setSelectedEmployee(undefined);
  }, []);

  const executeDeletion = React.useCallback(
    async (targets: Employee[]) => {
      let successCount = 0;

      for (const target of targets) {
        if (!target?.id) continue;
        try {
          await deleteEmployee(target.id);
          successCount += 1;
        } catch (error) {
          toast.error(`Erro ao excluir ${target.fullName ?? "funcionário"}`);
        }
      }

      if (successCount === 0) return;

      toast.success(
        successCount === 1
          ? "Funcionário excluído com sucesso!"
          : `${successCount} funcionários excluídos com sucesso!`
      );
    },
    [deleteEmployee]
  );

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
    setEmployeesToDelete([employee]);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeesToDelete.length) {
      resetDeletionState();
      return;
    }

    await executeDeletion(employeesToDelete);
    resetDeletionState();
  };

  const handleBulkDelete = React.useCallback(
    async (selected: Employee[]) => {
      if (!selected.length) return;
      await executeDeletion(selected);
    },
    [executeDeletion]
  );

  const deleteTitle =
    employeesToDelete.length > 1 ? "Excluir Funcionários" : "Excluir Funcionário";
  const deleteTargetLabel =
    employeesToDelete[0]?.fullName ?? "este funcionário";
  const deleteMessage =
    employeesToDelete.length > 1
      ? `Tem certeza que deseja excluir ${employeesToDelete.length} funcionários selecionados? Esta ação não pode ser desfeita.`
      : `Tem certeza que deseja excluir ${deleteTargetLabel}? Esta ação não pode ser desfeita.`;

  return (
    <div className="space-y-4">
      <DataTableGeneric
        columns={columns}
        data={employees}
        isLoading={isLoading}
        searchKey="fullName"
        onBulkDelete={handleBulkDelete}
        actionButton={{
          label: "Novo Funcionário",
          onClick: () => {
            setSelectedEmployee(undefined);
            setIsCreateOpen(true);
          },
        }}
        enableRowSelection
        includeSelection
        dateKey="createdAt"
        rowActions={[
          {
            label: "Visualizar",
            icon: <Eye className="mr-2 h-3 w-3 text-gray-600" />,
            onClick: (employee) => handleView(employee),
          },
          {
            label: "Editar",
            icon: <Edit className="mr-2 h-3 w-3 text-gray-600" />,
            onClick: (employee) => handleEdit(employee),
          },
          {
            label: "Excluir",
            icon: <Trash2 className="mr-2 h-3 w-3 text-gray-600" />,
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
        onClose={resetDeletionState}
        onConfirm={handleConfirmDelete}
        title={deleteTitle}
        isLoading={isDeleting}
        message={deleteMessage}
      />
    </div>
  );
}
