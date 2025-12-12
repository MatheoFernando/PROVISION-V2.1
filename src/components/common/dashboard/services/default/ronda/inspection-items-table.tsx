"use client";

import { useState } from "react";
import {
    useItemInspectionRounds,
    useUpdateItemInspectionRoundMutation,
    useDeleteItemInspectionRoundMutation,
} from "@/infrastructure/hooks/useItemInspectionRounds";
import { ItemInspectionRound } from "@/infrastructure/types/domain";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChecklistManager } from "./checklist-manager";
import { DeleteModal } from "@/components/ui/delete-modal";
import { format } from "date-fns";

export function InspectionItemsTable() {
    const t = useTranslations("Ronda");
    const { data: items = [], isLoading, refetch } = useItemInspectionRounds();
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
                    className="font-normal bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                    {row.original.category}
                </Badge>
            ),
        },
        {
            accessorKey: "description",
            header: "Descrição",
            cell: ({ row }) => (
                <span className="text-slate-700 dark:text-slate-300">
                    {row.original.description}
                </span>
            ),
        },
        {
            id: "createdAt",
            header: "Criado em",
            cell: ({ row }) => (
                <span className="text-sm text-slate-500 dark:text-slate-400">
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
