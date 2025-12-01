"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Supervision from "./default/supervision/supervision";
import Occurrence from "./default/occurrence/occurrence";
import { Rsu } from "./default/rsu/rsu";
import { useModules } from "@/infrastructure/hooks/useModules";
import { ListServices } from "./list-services";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";

type ServiceType = "supervision" | "occurrence" | "rsu" | "modules" | null;

export function DefaultServices() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view = searchParams.get("view") as ServiceType;

  const [selectedService, setSelectedService] = useState<ServiceType>(view || "supervision");

  const { data: modules = [], isLoading, isError } = useModules();
  const { isGlobalAdmin } = useAuthStore();

  useEffect(() => {
    setSelectedService(view || "supervision");
  }, [view]);

  const defaultServices = [
    {
      id: "supervision" as const,
      name: "Supervisão",
      description: "Serviço de supervisão e monitoramento",
      status: true,
      imageSrc: "/supervisionado.png",
    },
    {
      id: "occurrence" as const,
      name: "Ocorrência",
      description: "Gestão de ocorrências e incidentes",
      status: true,
      imageSrc: "/incidente.png",
    },
    {
      id: "rsu" as const,
      name: "RSU",
      description: "Recolha Seletiva de Resíduos",
      status: true,
      imageSrc: "/reciclar.png",
    },
    {
      id: "modules" as const,
      name: "Ver todos os serviços",
      description: isGlobalAdmin
        ? "Visualizar todos os serviços criados"
        : "Visualizar serviços criados na sua empresa",
      status: true,
      imageSrc: "/prioritize.png",
    },
  ] as const;

  const handleServiceClick = (serviceId: ServiceType) => {
    const newService = selectedService === serviceId ? null : serviceId;
    setSelectedService(newService);

    const params = new URLSearchParams(searchParams);
    if (newService) {
      params.set("view", newService);
    } else {
      params.delete("view");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 ">
        {defaultServices.map((service, index) => {
          const disabled = !service.status;
          const isSelected = selectedService === service.id;
          return (
            <div
              key={index}
              onClick={() => !disabled && handleServiceClick(service.id)}
              className={`border rounded-lg p-4 transition-all w-full cursor-pointer ${
                disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-accent"
              } ${isSelected ? "ring-2 ring-blue-400 bg-accent" : ""}`}
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
              </div>
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
            </div>
          );
        })}
      </div>

      {selectedService === "supervision" && (
        <div className="mt-6">
          <Supervision />
        </div>
      )}
      {selectedService === "occurrence" && (
        <div className="mt-6">
          <Occurrence />
        </div>
      )}
      {selectedService === "rsu" && (
        <div className="mt-6">
          <Rsu />
        </div>
      )}
      {selectedService === "modules" && (
        <div className="mt-6">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando serviços...</p>}
          {isError && (
            <p className="text-sm text-red-500">
              Erro ao carregar serviços. Tente novamente mais tarde.
            </p>
          )}
          {!isLoading && !isError && <ListServices services={modules} />}
        </div>
      )}
    </div>
  );
}
