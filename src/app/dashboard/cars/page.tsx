import { CarsTable } from "@/components/common/dashboard/cars/cars-table";

export default function CarsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Carros</h1>

      <CarsTable />
    </div>
  );
}

