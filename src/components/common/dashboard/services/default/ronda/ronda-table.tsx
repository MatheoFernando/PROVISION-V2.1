import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRounds, useDeleteRoundMutation, useRoundsByDate, useRoundsByNumber } from "@/infrastructure/hooks/useRounds";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { Round } from "@/infrastructure/types/domain";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, CheckCircle, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { RondaCreate } from "./ronda-create";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface RondaTableProps {
    onView: (round: Round) => void;
    onCreate: () => void;
}

export function RondaTable({ onView, onCreate }: RondaTableProps) {
    const t = useTranslations("Ronda");
    const { companyId } = useAuthStore();
    
    const [filterDate, setFilterDate] = useState<string>("");
    const [filterNumber, setFilterNumber] = useState<string>("");

    const { data: allRounds = [], isLoading: isLoadingAll, refetch: refetchAll } = useRounds(companyId || undefined, { enabled: !filterDate && !filterNumber });
    
    const { data: roundByDate, isLoading: isLoadingDate } = useRoundsByDate(
        companyId || "", 
        filterDate ? new Date(filterDate).toISOString() : "", 
        { enabled: !!companyId && !!filterDate }
    );

    const { data: roundByNumber, isLoading: isLoadingNumber } = useRoundsByNumber(
        companyId || "", 
        parseInt(filterNumber), 
        { enabled: !!companyId && !!filterNumber && !isNaN(parseInt(filterNumber)) }
    );

    const rounds = filterDate && roundByDate 
        ? [roundByDate] 
        : filterNumber && roundByNumber 
            ? [roundByNumber] 
            : allRounds;

    const isLoading = isLoadingAll || isLoadingDate || isLoadingNumber;
    const refetch = refetchAll; // Main refetch logic

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
            <div className="flex gap-4 mb-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="date"
                        placeholder="Filtrar por data"
                        className="pl-9"
                        value={filterDate}
                        onChange={(e) => {
                            setFilterDate(e.target.value);
                            setFilterNumber("");
                        }}
                    />
                    {filterDate && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-7 w-7"
                            onClick={() => setFilterDate("")}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="number"
                        placeholder="Filtrar por número da ronda"
                        className="pl-9"
                        value={filterNumber}
                        onChange={(e) => {
                            setFilterNumber(e.target.value);
                            setFilterDate("");
                        }}
                    />
                     {filterNumber && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-7 w-7"
                            onClick={() => setFilterNumber("")}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

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
