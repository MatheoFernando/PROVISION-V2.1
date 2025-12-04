"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Supervision from "./default/supervision/supervision";
import Occurrence from "./default/occurrence/occurrence";
import { Rsu } from "./default/rsu/rsu";
import { ListServices } from "./list-services";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useCompanyModules } from "@/infrastructure/hooks/useCompanyModules";
import { AdminServicesTabs } from "./admin-services-tabs";

type ServiceType = "supervision" | "occurrence" | "rsu" | "modules" | null;

export function DefaultServices() {
  const { isGlobalAdmin, companyId } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view = searchParams.get("view") as ServiceType;

  const [selectedService, setSelectedService] = useState<ServiceType>(
    view || (isGlobalAdmin ? "modules" : "supervision"),
  );

  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const {
    data: companyModules = [],
    isLoading,
    isError,
  } = useCompanyModules({
    companyId,
    isGlobalAdmin,
    status: statusFilter,
  });

  useEffect(() => {
    setSelectedService(view || (isGlobalAdmin ? "modules" : "supervision"));
  }, [view, isGlobalAdmin]);

  const defaultServices: Array<{
    id: ServiceType;
    name: string;
    description: string;
    status: boolean;
    imageSrc: string;
  }> = isGlobalAdmin
    ? [   ]
    : [
        {
          id: "supervision",
          name: "Supervisão",
          description: "Serviço de supervisão e monitoramento",
          status: true,
          imageSrc: "/supervisionado.png",
        },
        {
          id: "occurrence",
          name: "Ocorrência",
          description: "Gestão de ocorrências e incidentes",
          status: true,
          imageSrc: "/incidente.png",
        },
        {
          id: "rsu",
          name: "RSU",
          description: "Recolha Seletiva de Resíduos",
          status: true,
          imageSrc: "/reciclar.png",
        },
        {
          id: "modules",
          name: "Ver todos os serviços",
          description: "Visualizar serviços criados na sua empresa",
          status: true,
          imageSrc: "/prioritize.png",
        },
      ];

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
      <div className="flex flex-wrap gap-4">
        {defaultServices.map((service, index) => {
          const disabled = !service.status;
          const isSelected = selectedService === service.id;
         
          return (
            <div
              key={index}
              onClick={() => !disabled && handleServiceClick(service.id)}
              className={`border rounded-lg p-4 transition-all flex-1 cursor-pointer  ${isSelected ? "ring-2 ring-blue-400 bg-accent" : ""}`}
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
          {isGlobalAdmin ? (
            <AdminServicesTabs
              companyModules={companyModules}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              isLoading={isLoading}
              isError={isError}
            />
          ) : (
            <ListServices
              services={companyModules}
              isLoading={isLoading}
            />
          )}
        </div>
      )}
    </div>
  );
}
