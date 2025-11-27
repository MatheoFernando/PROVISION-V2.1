import { CustomersTable } from "@/components/common/dashboard/customers/customers-table";

export default function CustomersPage() {

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
      <CustomersTable
      />
    </div>
  );
}
