import { DefaultServices } from "@/components/common/dashboard/services/default-services";

export default function ServicePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
      <DefaultServices />
    </div>
  );
}
