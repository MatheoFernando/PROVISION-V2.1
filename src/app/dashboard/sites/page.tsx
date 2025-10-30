import { SitesTable } from "@/components/common/dashboard/sites/sites-table";

export default function SitesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Sites / postos</h1>

      <SitesTable />
    </div>
  );
}
