import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="h-11 cursor-pointer shadow-sm transition-all hover:shadow-md">
            <UserPlus className="mr-2 h-4 w-4" />
            Tornar utilizador do sistema
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white dark:bg-slate-950 border-none rounded-2xl shadow-2xl">
        <div className="flex flex-col">
          <DialogHeader className="border-b border-border/50 px-6 py-5 bg-muted/10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
                  Tornar Funcionário Utilizador
                </DialogTitle>
              </div>
            
            </div>
          </DialogHeader>
          <div className="flex-1 px-6 py-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
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
          <div className="flex items-center justify-end gap-3 border-t border-border/50 px-6 py-4 bg-muted/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="px-6 cursor-pointer rounded-xl"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 cursor-pointer shadow-sm hover:shadow-md transition-all rounded-xl"
            >
              {isSubmitting ? "A guardar..." : "Guardar associação"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
