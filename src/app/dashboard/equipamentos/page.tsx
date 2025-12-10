
import { EquipmentTable } from "@/components/common/dashboard/equipment/equipment-table";
import { TypeEquipmentTable } from "@/components/common/dashboard/type-equipment/type-equipment-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function EquipmentPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="equipment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="equipment" className="cursor-pointer">Equipamentos</TabsTrigger>
          <TabsTrigger value="types" className="cursor-pointer">Tipos de equipamento</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment">
          <EquipmentTable />
        </TabsContent>

        <TabsContent value="types">
          <TypeEquipmentTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
