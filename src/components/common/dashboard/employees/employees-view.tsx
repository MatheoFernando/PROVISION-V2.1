"use client";

import { Badge } from "@/components/ui/badge";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Employee } from "@/infrastructure/types/domain";

interface EmployeesViewProps {
  employee?: Employee;
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeesView({ employee, isOpen, onClose }: EmployeesViewProps) {
  if (!isOpen || !employee) return null;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      direction="right"
    >
      <DrawerContent className="h-full w-full sm:max-w-3xl">
        <div className="flex h-full flex-col">
          <DrawerHeader className="border-b border-border px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <DrawerTitle className="text-2xl font-bold text-foreground">
                Detalhes do Funcionário
              </DrawerTitle>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-4">
                  {employee.photo && (
                    <img
                      src={employee.photo}
                      alt={employee.fullName}
                      className="h-20 w-20 rounded-full border-2 border-border object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold">{employee.fullName}</h3>
                  </div>
                </div>
                  <Badge variant={employee.status ? "default" : "secondary"}>
                    {employee.status ? "Ativo" : "Inativo"}
                  </Badge>
              </div>

            

            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

