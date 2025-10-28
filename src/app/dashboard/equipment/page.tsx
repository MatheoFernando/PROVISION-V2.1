"use client";

import { EquipmentTable } from "@/components/common/dashboard/equipment/equipment-table";
import { TypeEquipmentTable } from "@/components/common/dashboard/type-equipment/type-equipment-table";
import { mockEquipments } from "@/infrastructure/schema/schema-equipment";
import { defaultTypeEquipments } from "@/infrastructure/schema/schema-type-equipment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EquipmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipamentos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os equipamentos e tipos de equipamento da empresa
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="equipments" className="w-full">
        <TabsList>
          <TabsTrigger value="equipments" className="cursor-pointer">Equipamentos</TabsTrigger>
          <TabsTrigger value="types" className="cursor-pointer">Tipos de Equipamento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="equipments" className="mt-6">
          <EquipmentTable mockData={mockEquipments} />
        </TabsContent>
        
        <TabsContent value="types" className="mt-6">
          <TypeEquipmentTable mockData={defaultTypeEquipments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
