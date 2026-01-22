"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppearanceSettings from '@/components/dashboard/settings/appearance-settings';
import GeneralSettings from '@/components/dashboard/settings/general-settings';
import { Palette, Shield, Settings } from 'lucide-react';

export default function SystemDefinitionsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Definições do Sistema</h2>
          <p className="text-muted-foreground">
            Gerencie as configurações globais da aplicação.
          </p>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
      
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Geral
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4">
          <AppearanceSettings />
        </TabsContent>


        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}