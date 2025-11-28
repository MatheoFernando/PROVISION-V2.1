"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsNine } from "phosphor-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import Image from "next/image";

export function ServicesMenu() {
  const router = useRouter();
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin);

  if (isGlobalAdmin) {
    return null;
  }

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const menuItems = [
    {
      path: "/dashboard/service/supervision",
      imageSrc: "/supervisionado.png",
      label: "Supervisão",
      imageClass: "bg-accent/10",
    },
    {
      path: "/dashboard/service/occurrence",
      imageSrc: "/incidente.png",
      label: "Ocorrências",
      imageClass: "bg-accent/10",
    },
    {
      path: "/dashboard/service/rsu",
      imageSrc: "/reciclar.png",
      label: "RSU",
      imageClass: "bg-accent/10",
    },
  ];

  return (
    <DropdownMenu >
      <DropdownMenuTrigger asChild >
        <DotsNine className="h-6 w-6 text-gray-700  cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 bg-card border-border/50 p-2 dark:bg-[#0f172a] "
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-foreground font-semibold mb-2 text-center">
          Serviços Rápidos
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50 mb-3" />
        <DropdownMenuGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {menuItems.map((item, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => handleNavigation(item.path)}
              className="flex flex-col items-center justify-center p-1 cursor-pointer hover:bg-muted/50 transition-all duration-200 rounded-lg border border-border/20 hover:border-border/40"
            >
              <div className={`rounded-lg p-2  ${item.imageClass}`}>
                <Image
                  src={item.imageSrc}
                  alt={item.label}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className="text-foreground text-sm font-medium text-center">
                {item.label}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}