"use client";

import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import Link from "next/link";
import Image from "next/image";

export function DefaultServices() {
  const { isGlobalAdmin } = useAuthStore();
  if (isGlobalAdmin) return null;

  const defaultServices = [
    {
      name: "Supervisão",
      description: "Serviço de supervisão e monitoramento",
      url: "/dashboard/service/supervision",
      status: true,
      imageSrc: "/supervisionado.png",
    },
    {
      name: "Ocorrência",
      description: "Gestão de ocorrências e incidentes",
      url: "/dashboard/service/occurrence",
      status: true,
      imageSrc: "/incidente.png",
    },
    {
      name: "RSU",
      description: "Recolha Seletiva de Resíduos",
      url: "/dashboard/service/rsu",
      status: false,
      imageSrc: "/reciclar.png",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {defaultServices.map((service, index) => {
          const disabled = !service.status;
          return (
            <div
              key={index}
              className={`border rounded-lg p-4 hover:bg-accent ${
                disabled ? "opacity-60" : ""
              }`}
            >
              <Link
                href={service.url}
                className={disabled ? "pointer-events-none" : ""}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2 bg-accent/10">
                      <Image
                        src={service.imageSrc}
                        alt={service.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                    <h3 className="font-semibold">{service.name}</h3>
                  </div>
                  <Badge
                    variant={disabled ? "secondary" : "default"}
                    className={disabled ? "" : "bg-green-500"}
                  >
                    {disabled ? "Desabilitado" : "Ativo"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
