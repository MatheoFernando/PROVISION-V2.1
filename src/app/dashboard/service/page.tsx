"use client";

import { useAuthStore } from '@/infrastructure/hooks/useAuthStore';
import { CreateService } from '@/components/common/dashboard/services/create-service';
import { ListServices } from '@/components/common/dashboard/services/list-services';
import { DefaultServices } from '@/components/common/dashboard/services/default-services';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { defaultServices, serviceSchema, type Service } from '@/infrastructure/schema/schema-service';

export default function ServicePage() {
  const { isGlobalAdmin } = useAuthStore();
  // Modo mock: não consome hooks de dados
  const MOCK_MODE = true;

  let services: Service[] = [];
  let isLoading = false as boolean;
  let error: unknown = null;
  let associations: any[] = [];

  if (MOCK_MODE) {
    // Gera ids estáveis a partir do customId para o DataTable
    services = serviceSchema.array().parse(
      defaultServices.map((s) => ({ ...s }))
    );
    isLoading = false;
    error = null;
    associations = [];
  } else {
 
  }

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

      {isGlobalAdmin ? (
        <ListServices services={services} isGlobalAdmin={true} />
      ) : (
        <div className="space-y-6">
          <DefaultServices />
        </div>
      )}
    </div>
  );
}
