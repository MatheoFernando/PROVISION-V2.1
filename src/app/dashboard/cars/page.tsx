import { CarsTable } from "@/components/common/dashboard/cars/cars-table";

export default function CarsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Veículos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os veículos da empresa
          </p>
        </div>
      </div>
      
      <CarsTable />
    </div>
  );
}




