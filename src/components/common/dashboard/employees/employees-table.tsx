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
import { useAreas } from "@/infrastructure/hooks/useAreas";
import { useZones } from "@/infrastructure/hooks/useZones";
import { useSectors } from "@/infrastructure/hooks/useSectors";
import { Employee } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";

import { DeleteModal } from "@/components/ui/delete-modal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useDepartments } from "@/infrastructure/hooks/useDepartments";
import { EmployeeDialog } from "./employee-create";
import { BulkImportDialog } from "@/components/common/base-ui/bulk-import";
import { type CreateGrossEmployeePayload } from "@/infrastructure/schema/schema-employees";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

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
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<
    Employee | undefined
  >();
  const [employeesToDelete, setEmployeesToDelete] =
    React.useState<Employee[]>([]);
  const [isBulkOpen, setIsBulkOpen] = React.useState(false);

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
            <div className="text-sm ">
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
          toast.error(`Erro ao eliminar ${target.fullName ?? "funcionário"}`);
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
    if (employee.id) {
      router.push(`/dashboard/funcionarios/${employee.id}`);
    }
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
      ? "Eliminar Funcionários"
      : "Eliminar Funcionário";
  const deleteTargetLabel =
    employeesToDelete[0]?.fullName ?? "este funcionário";
  const deleteMessage =
    employeesToDelete.length > 1
      ? `Tem certeza que deseja excluir ${employeesToDelete.length} funcionários selecionados? Esta ação não pode ser desfeita.`
      : `Tem certeza que deseja excluir ${deleteTargetLabel}? Esta ação não pode ser desfeita.`;



  const sourceEmployees = React.useMemo(
    () => data ?? employees,
    [data, employees],
  );




  const { data: areas = [] } = useAreas();
  const { data: zones = [] } = useZones();
  const { data: sectors = [] } = useSectors();

  const employeesWithDependencies = React.useMemo(() => {
    const ids = new Set<string>();
    areas.forEach((a) => a.employeeId && ids.add(a.employeeId));
    zones.forEach((z) => z.employeeId && ids.add(z.employeeId));
    sectors.forEach((s) => s.employeeId && ids.add(s.employeeId));
    return ids;
  }, [areas, zones, sectors]);

  return (
    <div className="space-y-4">


      <DataTableGeneric
        columns={columns}
        data={sourceEmployees}
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
            label: "Eliminar",
            icon: <Trash className="h-4 w-4 mr-2 text-gray-600" />,
            onClick: (employee) => handleDelete(employee),
            render: (employee, action) => {
              const hasDependencies = employeesWithDependencies.has(employee.id as string) || !!employee.siteId;
              return (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} className="w-full outline-none">
                        <DropdownMenuItem
                          className={`w-full cursor-pointer ${hasDependencies ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          onClick={(e) => {
                            if (hasDependencies) {
                              e.preventDefault();
                              e.stopPropagation();
                            } else {
                              action.onClick(employee);
                            }
                          }}
                        >
                          {action.icon && <span className="mr-2">{action.icon}</span>}
                          {action.label}
                        </DropdownMenuItem>
                      </span>
                    </TooltipTrigger>
                    {hasDependencies && (
                      <TooltipContent>
                        <p>Não pode excluir funcionário associado a Site/Área/Zona/Setor</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            },
          },
        ]}
      />



      <EmployeeDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setSelectedEmployee(undefined);
        }}
        employeeToEdit={selectedEmployee}
      />

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
