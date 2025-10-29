"use client";

import { useAuthStore } from '@/infrastructure/hooks/useAuthStore';
import { CreateService } from '@/components/common/dashboard/services/create-service';
import { ListServices } from '@/components/common/dashboard/services/list-services';
import { DefaultServices } from '@/components/common/dashboard/services/default-services';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type ModuleSchema } from '@/infrastructure/schema/schema-module';
import { useModules } from '@/infrastructure/hooks/useModules';
import { useServicesQuery } from '@/infrastructure/hooks/useServices';

export default function ServicePage() {
  const { isGlobalAdmin } = useAuthStore();
  const { data: services = [], isLoading, error } = useModules();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro</CardTitle>
          <CardDescription>
            Ocorreu um erro ao carregar os serviços.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

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




