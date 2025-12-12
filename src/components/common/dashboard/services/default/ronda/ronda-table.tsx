"use client";

import { useState } from "react";
import { useRounds, useUpdateRoundMutation, useDeleteRoundMutation } from "@/infrastructure/hooks/useRounds";
import { Round } from "@/infrastructure/types/domain";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { RondaCreate } from "./ronda-create";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useRouter } from "next/navigation";

interface RondaTableProps {
    onView: (round: Round) => void;
    onCreate: () => void;
}

export function RondaTable({ onView, onCreate }: RondaTableProps) {
    const t = useTranslations("Ronda");
    const { data: rounds = [], isLoading, refetch } = useRounds();
    const { mutate: deleteRound, isPending: isDeleting } = useDeleteRoundMutation();
    const router = useRouter();
    const [editingRound, setEditingRound] = useState<Round | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [roundToDelete, setRoundToDelete] = useState<string | null>(null);

    const formatTime = (timeString?: string) => {
        if (!timeString) return "—";
        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return timeString;
        }
    };

    const handleEdit = (round: Round) => {
        setEditingRound(round);
        setIsEditDialogOpen(true);
    };


    const handleDelete = (round: Round) => {
        if (!round.id) return;
        setRoundToDelete(round.id);
    };

    const confirmDelete = () => {
        if (roundToDelete) {
            deleteRound(roundToDelete, {
                onSuccess: () => {
                    setRoundToDelete(null);
                },
            });
        }
    };

    const columns: ColumnDef<Round>[] = [
        {
            accessorKey: "position",
            header: "Posição",
            cell: ({ row }) => (
                <span>{row.original.position}</span>
            ),
        },
        {
            id: "numberOfRounds",
            header: "Ciclo",
            cell: ({ row }) => (
                <span>{row.original.numberOfRounds}</span>
            ),
        },
        {
            accessorKey: "carId",
            header: "Viatura",
            cell: ({ row }) => (
                <span>{row.original.car?.model || "—"}</span>
            ),
        },
        {
            id: "location",
            header: "Área",
            cell: ({ row }) => (
                <span>{row.original.area?.name || "—"}</span>
            ),
        },
        {
            id: "timeStart",
            header: "Hora Início",
            cell: ({ row }) => (
                <span className="font-mono text-sm">{formatTime(row.original.timeStart)}</span>
            ),
        },
        {
            id: "timeEnd",
            header: "Hora Fim",
            cell: ({ row }) => (
                <span className="font-mono text-sm">{formatTime(row.original.timeEnd)}</span>
            ),
        },
        {
            id: "status",
            header: "Estado",
            cell: ({ row }) => (
                <Badge
                    className={`
                        ${!row.original.timeEnd
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-200"
                        }
                        border-transparent font-normal
                    `}
                >
                    {!row.original.timeEnd ? "Em Andamento" : "Finalizada"}
                </Badge>
            ),
        },
        {
            id: "kmStart",
            header: "Km Inicial",
            cell: ({ row }) => (
                <span>{row.original.kmStart}</span>
            ),
        },
        {
            id: "kmEnd",
            header: "Km Final",
            cell: ({ row }) => (
                <span>{row.original.kmEnd || "—"}</span>
            ),
        },
    ];

    return (
        <>
            <DataTableGeneric
                data={rounds}
                columns={columns}
                isLoading={isLoading}
                onRefetch={refetch}
                searchKey="position"
                placeholder="Pesquisar por posição..."
                rowActions={[
                    {
                        label: "Ver Detalhes",
                        icon: <Eye className="w-4 h-4" />,
                        onClick: (row) => onView(row),
                    },
                    {
                        label: "Finalizar",
                        icon: <CheckCircle className="w-4 h-4" />,
                        onClick: (row) => router.push(`/dashboard/modulos/ronda/${row.id}/checklist`),
                    },
                    {
                        label: "Editar",
                        icon: <Pencil className="w-4 h-4" />,
                        onClick: (row) => handleEdit(row),
                    },

                    {
                        label: "Eliminar",
                        icon: <Trash2 className="w-4 h-4" />,
                        onClick: (row) => handleDelete(row),

                    },
                ]}
                actionButton={{
                    label: t("create.button"),
                    onClick: onCreate,
                }}
            />

            {editingRound && (
                <RondaCreate
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    initialData={editingRound}
                />
            )}

            <DeleteModal
                isOpen={!!roundToDelete}
                onClose={() => setRoundToDelete(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
}
