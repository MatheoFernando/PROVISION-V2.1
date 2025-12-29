"use client";

import { useState } from "react";
import {
    useItemInspectionRounds,
    useDeleteItemInspectionRoundMutation,
} from "@/infrastructure/hooks/useItemInspectionRounds";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { ItemInspectionRound } from "@/infrastructure/types/domain";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { ChecklistManager } from "./checklist-manager";
import { DeleteModal } from "@/components/ui/delete-modal";
import { format } from "date-fns";

export function InspectionItemsTable() {
    const { companyId } = useAuthStore();
    const { data: items = [], isLoading, refetch } = useItemInspectionRounds(companyId || undefined);
    const { mutate: deleteItem, isPending: isDeleting } = useDeleteItemInspectionRoundMutation();

    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<ItemInspectionRound | null>(null);

    const handleDelete = (item: ItemInspectionRound) => {
        if (!item.id) return;
        setItemToDelete(item.id);
    };

    const handleEdit = (item: ItemInspectionRound) => {
        setEditingItem(item);
        setIsManagerOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteItem(itemToDelete, {
                onSuccess: () => {
                    setItemToDelete(null);
                },
            });
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "—";
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm");
        } catch {
            return dateString;
        }
    };

    const columns: ColumnDef<ItemInspectionRound>[] = [
        {
            accessorKey: "category",
            header: "Categoria",
            cell: ({ row }) => (
                <Badge
                    variant="secondary"
                    className=" dark:bg-slate-800"
                >
                    {row.original.category}
                </Badge>
            ),
        },
        {
            accessorKey: "description",
            header: "Descrição",
            cell: ({ row }) => (
                <span >
                    {row.original.description}
                </span>
            ),
        },
        {
            id: "createdAt",
            header: "Criado em",
            cell: ({ row }) => (
                <span>
                    {formatDate(row.original.createdAt)}
                </span>
            ),
        },
    ];

    return (
        <>
            <DataTableGeneric
                data={items}
                columns={columns}
                isLoading={isLoading}
                onRefetch={refetch}
                searchKey="category"
                placeholder="Pesquisar por categoria..."
                rowActions={[
                    {
                        label: "Eliminar",
                        icon: <Trash2 className="w-4 h-4" />,
                        onClick: (row) => handleDelete(row),
                    },
                    {
                        label: "Editar",
                        icon: <Pencil className="w-4 h-4" />,
                        onClick: (row) => handleEdit(row),
                    },
                ]}
                actionButton={{
                    label: "Novo Item",
                    onClick: () => setIsManagerOpen(true),
                }}
            />

            <ChecklistManager
                open={isManagerOpen}
                onOpenChange={(open) => {
                    setIsManagerOpen(open);
                    if (!open) setEditingItem(null);
                }}
                initialItemToEdit={editingItem}
                defaultOpenForm={true}
            />

            <DeleteModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
}
