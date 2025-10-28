"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Grip, Shield, AlertTriangle, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";

export function ServicesMenu() {
  const router = useRouter();
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin);

  // Só mostra o menu se NÃO for global admin
  if (isGlobalAdmin) {
    return null;
  }

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="lg" 
          className="text-white hover:text-white/80 hover:bg-white/10 transition-colors duration-200 p-2 cursor-pointer"
        >
          <Grip className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 md:w-64 bg-card border-border/50 " 
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-foreground font-semibold">
          Serviços Rápidos
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50 " />
        <DropdownMenuGroup className="grid grid-cols-2 md gap-2">
          <DropdownMenuItem 
            onClick={() => handleNavigation("/dashboard/service/supervision")}
            className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
          >
            <Shield className="mr-2 h-4 w-4 text-primary" />
            <span className="text-foreground">Supervisão</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleNavigation("/dashboard/service/occurrence")}
            className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
          >
            <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
            <span className="text-foreground">Ocorrências</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleNavigation("/dashboard/service/rsu")}
            className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
          >
            <Package className="mr-2 h-4 w-4 text-accent-foreground" />
            <span className="text-foreground">RSU</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
