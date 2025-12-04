"use client";

import React from "react";
import { Eye, PencilSimple, Trash, X } from "phosphor-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import {
  useCreateGrossEmployee,
  useDeleteEmployee,
  useEmployees,
  useEmployeeByCod,
  useEmployeesByName,
} from "@/infrastructure/hooks/useEmployees";
import { Employee } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { EmployeesView } from "./employees-view";
import { DeleteModal } from "@/components/ui/delete-modal";
import { toast } from "sonner";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useDepartments } from "@/infrastructure/hooks/useDepartments";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import EmployeesCreatePage from "./employee-create";
import { BulkImportDialog } from "@/components/common/base-ui/bulk-import";
import { type CreateGrossEmployeePayload } from "@/infrastructure/schema/schema-employees";
import { Input } from "@/components/ui/input";

interface EmployeesTableProps {
  companyId?: string;
  siteIds?: string[];
  data?: Employee[];
  isLoadingOverride?: boolean;
}

export function EmployeesTable({ companyId: companyIdProp, siteIds, data, isLoadingOverride }: EmployeesTableProps = {}) {
  const fallbackCompanyId = useAuthStore((state) => state.companyId) ?? "";
  const userId = useAuthStore((state) => state.userId) ?? "";
  const companyId = companyIdProp ?? fallbackCompanyId;
  const shouldFetch = !data;
  const { data: employees = [], isLoading } = useEmployees(companyId, { enabled: shouldFetch });
  const { data: departments = [] } = useDepartments();
  const { mutateAsync: deleteEmployee, isPending: isDeleting } =
    useDeleteEmployee(companyId);
  const createGrossEmployee = useCreateGrossEmployee();
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<
    Employee | undefined
  >();
  const [employeesToDelete, setEmployeesToDelete] =
    React.useState<Employee[]>([]);
  const [isBulkOpen, setIsBulkOpen] = React.useState(false);
  const [codFilter, setCodFilter] = React.useState("");
  const [nameFilter, setNameFilter] = React.useState("");

  const departmentIdToName = React.useMemo(() => {
    return Object.fromEntries(
      (departments ?? []).map((department) => [department.id, department.name])
    ) as Record<string, string>;
  }, [departments]);

  const columns = React.useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "cod",
        size: 50,
        header: "Código",
        cell: ({ row }) => {
          const cod = row.getValue("cod") as string;
          return (
            <div className="text-sm text-muted-foreground font-medium">
              {cod}
            </div>
          );
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
        accessorKey: "departmentId",
        header: "Departamento",
        cell: ({ row }) => {
          const departmentId = row.getValue("departmentId") as string;
          const departmentName =
            departmentIdToName[departmentId] ?? "Não informado";
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
    ],
    [departmentIdToName]
  );

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
          await deleteEmployee({ id: target.id, companyId });
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

  const deleteTitle =
    employeesToDelete.length > 1
      ? "Excluir Funcionários"
      : "Excluir Funcionário";
  const deleteTargetLabel =
    employeesToDelete[0]?.fullName ?? "este funcionário";
  const deleteMessage =
    employeesToDelete.length > 1
      ? `Tem certeza que deseja excluir ${employeesToDelete.length} funcionários selecionados? Esta ação não pode ser desfeita.`
      : `Tem certeza que deseja excluir ${deleteTargetLabel}? Esta ação não pode ser desfeita.`;

  const { data: employeeByCod, error: codFilterError } = useEmployeeByCod(
    codFilter.trim() ? codFilter.trim() : undefined,
    companyId,
  );
  const {
    data: employeesByName = [],
    error: nameFilterError,
  } = useEmployeesByName(
    nameFilter.trim() ? nameFilter.trim() : undefined,
    companyId,
  );

  const sourceEmployees = React.useMemo(
    () => data ?? employees,
    [data, employees],
  );

  const apiFilteredEmployees = React.useMemo(() => {
    const trimmedCod = codFilter.trim();
    const trimmedName = nameFilter.trim();

    // Prioridade: filtro por código
    if (trimmedCod) {
      if (codFilterError) return [];
      if (employeeByCod === null) return [];
      if (employeeByCod) return [employeeByCod];
      // carregando: não mostrar lista completa para não confundir
      return [];
    }

    // Segundo: filtro por nome
    if (trimmedName) {
      if (nameFilterError) return [];
      if (employeesByName.length === 0) return [];
      return employeesByName;
    }

    // Sem filtros → lista padrão
    return sourceEmployees;
  }, [
    codFilter,
    nameFilter,
    codFilterError,
    nameFilterError,
    employeeByCod,
    employeesByName,
    sourceEmployees,
  ]);

  const filteredEmployees = React.useMemo(() => {
    const base = apiFilteredEmployees;
    if (!siteIds?.length) return base;
    const ids = new Set(siteIds.filter(Boolean));
    return base.filter((employee) => ids.has(employee.siteId));
  }, [apiFilteredEmployees, siteIds]);

  
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Código do funcionário
          </label>
          <Input
            value={codFilter}
            onChange={(event) => setCodFilter(event.target.value)}
            placeholder="Filtrar por código "
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Nome do funcionário
          </label>
          <Input
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            placeholder="Filtrar por nome "
            className="h-9"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 cursor-pointer"
            onClick={() => {
              setCodFilter("");
              setNameFilter("");
            }}
          >
            Limpar filtros
          </Button>
        </div>
      </div>

 

      <DataTableGeneric
        columns={columns}
        data={filteredEmployees}
        isLoading={isLoadingOverride ?? isLoading}
        searchKey="fullName"
        actionButton={{
          label: "Novo Funcionário",
          onClick: () => {
            setSelectedEmployee(undefined);
            setIsCreateOpen(true);
          },
        }
      }
        bulkImportButton={{
          label: "Importar funcionários",
          onClick: () => setIsBulkOpen(true),
        }}
        dateKey="createdAt"
        rowActions={[
          {
            label: "Visualizar",
            icon: <Eye className="mr-2 h-3 w-3 text-gray-600" />,
            onClick: (employee) => handleView(employee),
          },
          {
            label: "Editar",
            icon: <PencilSimple className="mr-2 h-3 w-3 text-gray-600" />,
            onClick: (employee) => handleEdit(employee),
          },
          {
            label: "Excluir",
            icon: <Trash className="h-4 w-4 mr-2 text-gray-600" />,
            onClick: (employee) => handleDelete(employee),
          },
        ]}
      />

      <EmployeesView
        employee={selectedEmployee}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />

      <Drawer
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsCreateOpen(true);
            return;
          }
          setIsCreateOpen(false);
          setSelectedEmployee(undefined);
        }}
        direction="right"
      >
        <DrawerContent className="h-full w-full sm:max-w-xl">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DrawerTitle className="text-2xl font-bold text-foreground">
                    {selectedEmployee
                      ? "Editar Funcionário"
                      : "Novo Funcionário"}
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
              <EmployeesCreatePage
                id={selectedEmployee?.id}
                initialData={selectedEmployee as any}
                onSuccess={() => {
                  setIsCreateOpen(false);
                  setSelectedEmployee(undefined);
                }}
                onCancel={() => {
                  setIsCreateOpen(false);
                  setSelectedEmployee(undefined);
                }}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={resetDeletionState}
        onConfirm={handleConfirmDelete}
        title={deleteTitle}
        isLoading={isDeleting}
        message={deleteMessage}
      />

      <BulkImportDialog<CreateGrossEmployeePayload>
        isOpen={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        title="Importação em massa de funcionários"
        columns={[
          { key: "cod", label: "Código", required: true },
          { key: "fullName", label: "Nome completo", required: true },
          { key: "function", label: "Função", required: true },
          { key: "nameSite", label: "Nome do site registrado", required: false },
          { key: "nameDepartment", label: "Nome do departamento registrado", required: true },
          { key: "addressHouseHold", label: "Morada", required: true },
          { key: "addressCommune", label: "Comuna", required: true },
          { key: "addressMunicipality", label: "Município", required: true },
          { key: "addressProvince", label: "Província", required: true },
          { key: "addressCountry", label: "País", required: true },
          { key: "contactEmail", label: "Email", required: false },
          { key: "contactPhones", label: "Telefones ", required: false },
        ]}
        shouldValidate={false}
        mapRawToInput={(raw) => {
          const phoneNumbers = (raw.contactPhones ?? "")
            .split(/[;,]/)
            .map((phone) => phone.trim())
            .filter(Boolean)
            .map((phone) => ({ phone }));

          return {
            cod: raw.cod ?? "",
            companyId,
            fullName: raw.fullName ?? "",
            function: raw.function ?? "",
            contact: {
              companyId,
              email: raw.contactEmail || undefined,
              phoneNumbers: phoneNumbers.length ? phoneNumbers : undefined,
            },
            address: {
              houseHold: raw.addressHouseHold ?? "",
              commune: raw.addressCommune ?? "",
              municipality: raw.addressMunicipality ?? "",
              province: raw.addressProvince ?? "",
              country: raw.addressCountry ?? "",
            },
            nameSite: raw.nameSite ?? "",
            userId,
            nameDepartment: raw.nameDepartment ?? "",
          };
        }}
        onCreate={async (payload) => {
          await createGrossEmployee.mutateAsync(payload);
        }}
      />
    </div>
  );
}
