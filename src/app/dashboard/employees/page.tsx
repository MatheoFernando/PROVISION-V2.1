import { EmployeesTable } from "@/components/common/dashboard/employees/employees-table";

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground">
            Gerencie todos os funcionários da empresa
          </p>
        </div>
      </div>
      
      <EmployeesTable />
    </div>
  );
}




