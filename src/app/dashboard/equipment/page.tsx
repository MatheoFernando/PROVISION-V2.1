"use client";

import { EquipmentTable } from "@/components/common/dashboard/equipment/equipment-table";
import { TypeEquipmentTable } from "@/components/common/dashboard/type-equipment/type-equipment-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EquipmentPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="equipments" className="w-full">
        <TabsList>
          <TabsTrigger value="equipments" className="cursor-pointer">
            Equipamentos
          </TabsTrigger>
          <TabsTrigger value="types" className="cursor-pointer">
            Tipos de Equipamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipments" className="mt-6">
          <EquipmentTable />
        </TabsContent>

        <TabsContent value="types" className="mt-6">
          <TypeEquipmentTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
