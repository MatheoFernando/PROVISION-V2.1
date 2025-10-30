"use client";

import { useAuthStore } from '@/infrastructure/hooks/useAuthStore';
import { CreateService } from '@/components/common/dashboard/services/create-service';
import { ListServices } from '@/components/common/dashboard/services/list-services';
import { DefaultServices } from '@/components/common/dashboard/services/default-services';

import { type ModuleSchema } from '@/infrastructure/schema/schema-module';
import { useModules } from '@/infrastructure/hooks/useModules';

export default function ServicePage() {
  const { isGlobalAdmin } = useAuthStore();
  const { data: services = [], isLoading, error } = useModules();


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">
            {isGlobalAdmin 
              ? 'Gerencie todos os serviços do sistema.' 
              : 'Visualize os serviços disponíveis para sua empresa'
            }
          </p>
        </div>
        {isGlobalAdmin && <CreateService />}
      </div>

      <ListServices services={services as ModuleSchema[]} isGlobalAdmin={isGlobalAdmin} />
    </div>
  );
}




