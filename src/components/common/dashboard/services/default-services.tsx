"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { defaultServices } from '@/infrastructure/schema/schema-service';
import { useAuthStore } from '@/infrastructure/hooks/useAuthStore';
import { useServicesQuery } from '@/infrastructure/hooks/useServices';
import Link from 'next/link';
import { useMemo } from 'react';

export function DefaultServices() {
  const { isGlobalAdmin } = useAuthStore();
  const { data: createdServices = [] } = useServicesQuery();
  
  if (isGlobalAdmin) return null;

  const customServices = useMemo(() => {
    return createdServices.filter(service => 
      !defaultServices.some(defaultService => defaultService.name === service.name)
    );
  }, [createdServices]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Serviços Padrão</CardTitle>
          <CardDescription>
            Estes são os serviços padrão disponíveis para sua empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {defaultServices.map((service, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-accent">
                <Link href={service.url}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{service.name}</h3>
                    <Badge variant="default" className='bg-green-500'>Ativo</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {customServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Serviços Personalizados</CardTitle>
            <CardDescription>
              Serviços criados especificamente para sua empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customServices.map((service, index) => (
                <div key={service.id || index} className="border rounded-lg p-4 hover:bg-accent relative">
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-green-600 text-white text-xs">Novo</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{service.name}</h3>
                    <Badge variant={service.status ? "default" : "destructive"} className={service.status ? 'bg-green-500' : ''}>
                      {service.status ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {service.description || 'Sem descrição'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

