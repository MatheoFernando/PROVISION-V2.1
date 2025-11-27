import { EmployeesTable } from "@/components/common/dashboard/employees/employees-table";

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
      <EmployeesTable />
    </div>
  );
}
