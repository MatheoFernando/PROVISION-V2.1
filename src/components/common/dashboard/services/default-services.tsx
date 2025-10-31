"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { defaultServices } from '@/infrastructure/schema/schema-service';
import { useAuthStore } from '@/infrastructure/hooks/useAuthStore';
import Link from 'next/link';

export function DefaultServices() {
  const { isGlobalAdmin } = useAuthStore();
  if (isGlobalAdmin) return null;



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

    
    </div>
  );
}

