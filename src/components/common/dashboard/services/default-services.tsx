"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Supervision from "./default/supervision/supervision";
import Occurrence from "./default/occurrence/occurrence";
import { Rsu } from "./default/rsu/rsu";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useCompanyModules } from "@/infrastructure/hooks/useCompanyModules";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import RondaPage from "./default/ronda/ronda";

type ServiceType = string | null;

export function DefaultServices() {
  const t = useTranslations("Services");
  const { companyId } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view = searchParams.get("view") as ServiceType;

  const { data: companyModules = [] } = useCompanyModules({
    companyId,
    status: true,
  });

  const [selectedService, setSelectedService] = useState<ServiceType>(
    view || "supervision",
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  useEffect(() => {
    if (!view && !selectedService) {
      setSelectedService("supervision");
    } else if (view) {
      setSelectedService(view);
    }
  }, [view]);

  const baseServices = [
    {
      id: "supervision",
      name: t("supervision.name"),
      description: t("supervision.description"),
      status: true,
      imageSrc: "/supervisionado.png",
    },
    {
      id: "occurrence",
      name: t("occurrence.name"),
      description: t("occurrence.description"),
      status: true,
      imageSrc: "/incidente.png",
    },
    {
      id: "rsu",
      name: t("rsu.name"),
      description: t("rsu.description"),
      status: true,
      imageSrc: "/reciclar.png",
    },
    {
      id: "ronda",
      name: t("ronda.name"),
      description: t("ronda.description"),
      status: true,
      imageSrc: "/transparency.png",
    },
  ];

  const dynamicServices = companyModules
    .filter((m) => {
      const isBase = baseServices.some(
        (base) => base.name.toLowerCase() === m.module?.name?.toLowerCase()
      );
      return !isBase;
    })
    .map((m) => ({
      id: m.module?.id || m.moduleId || `dynamic-${Math.random()}`,
      name: m.module?.name || "Módulo Sem Nome",
      description: m.module?.description || "Módulo adicional",
      status: true,
      imageSrc: "/prioritize.png",
    }));

  const services = [...baseServices, ...dynamicServices];

  const handleServiceClick = (serviceId: string) => {
    const newService = selectedService === serviceId ? null : serviceId;
    setSelectedService(newService);

    const params = new URLSearchParams(searchParams);
    if (newService) {
      params.set("view", newService);
    } else {
      params.delete("view");
    }
    router.push(`${pathname}?${params.toString()}`);
    setTimeout(checkScroll, 300);
  };

  useEffect(() => {
    checkScroll();
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener("resize", checkScroll);
    return () => {
      window.removeEventListener("resize", checkScroll);
      clearTimeout(timer);
    };
  }, [services.length]);

  return (
    <div className="space-y-1">
      <div className="hidden md:flex items-center gap-4 relative p-2 group">
        {showLeftScroll && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 h-10 w-10 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-black/5 dark:border-white/10 text-foreground/80 hover:text-foreground rounded-full flex items-center justify-center shadow-lg transition-all z-20 hover:scale-105 active:scale-95 cursor-pointer"
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto gap-4 py-4 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] px-1"
          style={{ scrollBehavior: 'smooth' }}
        >
          {services.map((service, index) => {
            const disabled = !service.status;
            const isSelected = selectedService === service.id;

            return (
              <div
                key={index}
                onClick={() => !disabled && handleServiceClick(service.id)}
                className={`min-w-[220px] max-w-[220px] h-[140px] rounded p-5 transition-all duration-300 cursor-pointer flex-shrink-0 flex flex-col justify-between
                  ${isSelected
                    ? " dark:bg-zinc-800 shadow-xl shadow-blue-500/10 ring-1 ring-black/5 dark:ring-white/10 transform scale-[1.02]"
                    : " dark:bg-zinc-900/60 hover:bg-white hover:dark:bg-zinc-800 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-0.5"
                  } border border-transparent`}
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-full p-2.5 `}>
                    <Image
                      src={service.imageSrc}
                      alt={service.name}
                      width={35}
                      height={35}
                      className={`h-6 w-6 object-contain`}
                    />
                  </div>
                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                </div>

                <div>
                  <h3 className="font-semibold text-[15px] tracking-tight text-foreground/90 mb-1">{service.name}</h3>
                  <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>


        {showRightScroll && (
          <button
            onClick={scrollRight}
            className="absolute right-0 h-10 w-10 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-black/5 dark:border-white/10 text-foreground/80 hover:text-foreground rounded-full flex items-center justify-center shadow-lg transition-all z-20 hover:scale-105 active:scale-95 cursor-pointer"
            type="button"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex md:hidden gap-3">
        {(() => {
          const activeService = services.find(s => s.id === selectedService) || services[0];

          if (!activeService) return null;

          return (
            <div
              onClick={() => !activeService.status && handleServiceClick(activeService.id)}
              className={`flex-1 rounded p-5 transition-all cursor-pointer flex flex-col justify-between h-[120px]
                ${selectedService === activeService.id
                  ? " dark:bg-zinc-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10"
                  : "bg-muted/50"
                }`}
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-full p-2`}>
                  <Image
                    src={activeService.imageSrc}
                    alt={activeService.name}
                    width={25}
                    height={25}
                    className={`h-5 w-5 object-contain `}
                  />
                </div>
                {selectedService === activeService.id && <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />}
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-tight text-foreground/90">{activeService.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {activeService.description}
                </p>
              </div>
            </div>
          );
        })()}

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <div className="w-[100px] bg-white/40 dark:bg-zinc-900/40 border border-dashed border-black/10 dark:border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/60 dark:hover:bg-zinc-900/60 transition-colors h-[120px]">
              <div className="h-8 w-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                <span className="text-lg font-medium text-muted-foreground">+</span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground text-center leading-tight">Ver<br />outros</span>
            </div>
          </DrawerTrigger>
          <DrawerContent className="bg-white dark:bg-zinc-950 rounded-t-[32px] border-none shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-800 mt-4 mb-2" />
            <DrawerHeader className="text-center pb-2">
              <DrawerTitle className="text-xl font-bold tracking-tight">Serviços</DrawerTitle>
              <DrawerDescription className="text-muted-foreground/80">
                Selecione o módulo que deseja acessar
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-6 grid gap-3 max-h-[70vh] overflow-y-auto">
              {services.map((service, index) => {
                const disabled = !service.status;
                const isSelected = selectedService === service.id;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (!disabled) {
                        handleServiceClick(service.id);
                        setIsDrawerOpen(false);
                      }
                    }}
                    className={`rounded p-4 transition-all duration-200 cursor-pointer flex items-center gap-4
                      ${isSelected
                        ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50"
                        : "bg-gray-50/50 dark:bg-zinc-900/50 border border-transparent hover:bg-gray-100 dark:hover:bg-zinc-900"
                      } ${disabled ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
                  >
                    <div className={`flex-shrink-0 rounded-xl p-3 `}>
                      <Image
                        src={service.imageSrc}
                        alt={service.name}
                        width={24}
                        height={24}
                        className={`h-6 w-6 object-contain`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`font-semibold text-[15px]`}>
                          {service.name}
                        </h3>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                      </div>
                      <p className={`text-[13px] line-clamp-1 ${isSelected ? "text-blue-600/80 dark:text-blue-400/80" : "text-muted-foreground"}`}>
                        {service.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-6 pt-2 pb-8">
              <DrawerClose asChild>
                <button className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground py-3 bg-gray-100 dark:bg-zinc-900 rounded-2xl transition-colors">
                  Fechar
                </button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {selectedService === "supervision" && (
        <Supervision />
      )}
      {selectedService === "occurrence" && (
        <Occurrence />
      )}

      {selectedService === "rsu" && (
        <Rsu />
      )}
      {selectedService === "ronda" && (
        <RondaPage/>
      )}

      {!baseServices.some(s => s.id === selectedService) && selectedService && (
        <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
          <h3 className="text-lg font-medium text-foreground mb-2">Módulo: {services.find(s => s.id === selectedService)?.name}</h3>
          <p>O conteúdo deste módulo será carregado aqui.</p>
        </div>
      )}
    </div>
  );
}
