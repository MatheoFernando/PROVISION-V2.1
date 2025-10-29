import { SitesTable } from "@/components/common/dashboard/sites/sites-table";

export default function SitesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sites / postos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os sites da empresa
          </p>
        </div>
      </div>
      
      <SitesTable />
    </div>
  );
}




