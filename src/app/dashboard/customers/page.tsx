import { CustomersTable } from "@/components/common/dashboard/customers/customers-table";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie todos os clientes da empresa
          </p>
        </div>
      </div>
      
      <CustomersTable />
    </div>
  );
}
