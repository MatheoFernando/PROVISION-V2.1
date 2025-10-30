import { ContainersTable } from "@/components/common/dashboard/containers/containers-table";

export default function ContainersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Containers</h1>

      <ContainersTable />
    </div>
  );
}
