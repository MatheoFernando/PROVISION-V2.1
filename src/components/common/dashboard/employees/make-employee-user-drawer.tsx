"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { EmployeeSelect } from "@/components/common/base-ui/selects/employee-select";
import { UserSelect } from "@/components/common/base-ui/selects/user-select";
import {
  useEmployees,
  useUpdateEmployee,
} from "@/infrastructure/hooks/useEmployees";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { toast } from "sonner";
import { UserPlus, X } from "lucide-react";
import type { Employee } from "@/infrastructure/types/domain";

interface MakeEmployeeUserDrawerProps {
  children?: React.ReactNode;
}

export function MakeEmployeeUserDrawer({
  children,
}: MakeEmployeeUserDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] =
    React.useState<string>("");
  const [selectedUserId, setSelectedUserId] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const companyId = useAuthStore((s) => s.companyId) ?? "";
  const { data: employees = [] } = useEmployees(companyId);
  const updateEmployee = useUpdateEmployee();

  const selectedEmployee: Employee | undefined = React.useMemo(() => {
    if (!selectedEmployeeId) return undefined;
    const list = Array.isArray(employees) ? employees : [];
    return list.find((e) => e.id === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);

  const handleSubmit = async () => {
    if (!selectedEmployeeId || !selectedUserId) {
      toast.error("Selecione o funcionário e o utilizador.");
      return;
    }

    if (!selectedEmployee) {
      toast.error(
        "Não foi possível carregar os dados do funcionário selecionado."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        id: selectedEmployee.id as string,
        cod: selectedEmployee.cod,
        companyId: selectedEmployee.companyId,
        fullName: selectedEmployee.fullName,
        photo: selectedEmployee.photo,
        function: selectedEmployee.function,
        contactId: selectedEmployee.contactId,
        addressId: selectedEmployee.addressId,
        siteId: selectedEmployee.siteId,
        departmentId: selectedEmployee.departmentId,
        userId: selectedUserId,
      };

      await updateEmployee.mutateAsync(payload);
      toast.success("Funcionário associado ao utilizador com sucesso!");
      setOpen(false);
      setSelectedEmployeeId("");
      setSelectedUserId("");
    } catch (error) {
      toast.error("Erro ao associar funcionário ao utilizador.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        {children || (
          <Button className="h-10 cursor-pointer shadow-sm transition-all hover:shadow-md">
            <UserPlus className="mr-2 h-4 w-4" />
            Tornar utilizador do sistema
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="h-full w-full sm:max-w-xl">
        <div className="flex h-full flex-col">
          <DrawerHeader className="border-b border-border px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DrawerTitle className="text-2xl font-bold text-foreground">
                  Tornar Funcionário Utilizador
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
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Funcionário
                </p>
                <EmployeeSelect
                  value={selectedEmployeeId}
                  onChange={setSelectedEmployeeId}
                  companyId={companyId}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Utilizador da aplicação
                </p>
                <UserSelect
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                  companyId={companyId}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="px-6 cursor-pointer"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 bg-blue-500 hover:bg-blue-600 cursor-pointer text-white shadow-sm hover:shadow-md transition-all"
            >
              {isSubmitting ? "Salvando..." : "Salvar associação"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
