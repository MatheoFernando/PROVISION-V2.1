import Occurrence from "@/components/common/dashboard/services/default/occurrence/occurrence"

export default function OccurrencePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ocorrência</h1>
      <Occurrence />
    </div>
  );
}