"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDeleteTypeEquipment } from "@/infrastructure/hooks/useTypeEquipment";
import { TypeEquipment } from "@/infrastructure/schema/schema-type-equipment";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TypeEquipmentModalsProps {
  typeEquipmentToDelete?: TypeEquipment;
  isOpen: boolean;
  onCloseDelete: () => void;
}

export function TypeEquipmentModals({ typeEquipmentToDelete, isOpen, onCloseDelete }: TypeEquipmentModalsProps) {
  const deleteTypeEquipment = useDeleteTypeEquipment();

  if (!isOpen || !typeEquipmentToDelete) return null;

  const handleDelete = async () => {
    if (!typeEquipmentToDelete) return;

    try {
      await deleteTypeEquipment.mutateAsync(typeEquipmentToDelete.id);
      toast.success("Tipo de equipamento excluído com sucesso!");
      onCloseDelete();
    } catch (error) {
      toast.error("Erro ao excluir tipo de equipamento");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onCloseDelete}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Tipo de Equipamento</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este tipo de equipamento? Esta ação não pode ser desfeita.
            {typeEquipmentToDelete && (
              <div className="mt-4 p-4 bg-muted rounded-lg border">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{typeEquipmentToDelete.name}</h4>
                    <Badge variant="outline">
                      Tipo de Equipamento
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Descrição:</strong> {typeEquipmentToDelete.description || "Sem descrição"}</p>
                    <p><strong>ID:</strong> {typeEquipmentToDelete.id}</p>
                  </div>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}