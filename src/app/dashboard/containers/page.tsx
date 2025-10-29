import { ContainersTable } from "@/components/common/dashboard/containers/containers-table";

export default function ContainersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Containers</h1>
          <p className="text-muted-foreground">
            Gerencie todos os containers da empresa
          </p>
        </div>
      </div>
      
      <ContainersTable />
    </div>
  );
}




