import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useAreas } from "@/infrastructure/hooks/useAreas";
import { useZones } from "@/infrastructure/hooks/useZones";
import { useSectors, useDeleteSector } from "@/infrastructure/hooks/useSectors";
import { useSites } from "@/infrastructure/hooks/useSites";
import { useEmployees } from "@/infrastructure/hooks/useEmployees";
import { DeleteModal } from "@/components/ui/delete-modal";
import { AreaColumn } from "./area-column";
import { ZoneColumn } from "./zone-column";
import { SectorColumn } from "./sector-column";
import { SiteColumn } from "./site-column";

interface OrgKanbanViewProps {
    onAdd: (data: any) => void;
}

export function OperationalView({ onAdd }: OrgKanbanViewProps) {
    const t = useTranslations("OrganizationalStructure");
    const { data: areas = [], isLoading: isLoadingAreas } = useAreas();
    const { data: zones = [], isLoading: isLoadingZones } = useZones();
    const { data: sectors = [], isLoading: isLoadingSectors } = useSectors();
    const { data: sites = [], isLoading: isLoadingSites } = useSites();
    const { data: employees = [] } = useEmployees();

    const queryClient = useQueryClient();
    const { mutate: deleteSector } = useDeleteSector();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: "AREA" | "ZONE" | "SECTOR", id: string, name: string } | null>(null);

    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);

    const handleDelete = (e: React.MouseEvent, type: "AREA" | "ZONE" | "SECTOR", id: string, name: string) => {
        e.stopPropagation();
        setItemToDelete({ type, id, name });
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;

        const { type, id } = itemToDelete;

        if (type === "SECTOR") {
            deleteSector(id, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['sectors'] });
                    queryClient.invalidateQueries({ queryKey: ['sites'] });
                    if (selectedSectorId === id) setSelectedSectorId(null);
                }
            });
        }
        setDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const filteredZones = selectedAreaId
        ? zones.filter(z => z.areaId === selectedAreaId)
        : [];

    const filteredSectors = selectedZoneId
        ? sectors.filter(s => s.zoneId === selectedZoneId)
        : selectedAreaId
            ? sectors.filter(s => filteredZones.some(z => z.id === s.zoneId))
            : [];

    const filteredSites = selectedSectorId
        ? sites.filter(s => s.sectorId === selectedSectorId)
        : selectedZoneId
            ? sites.filter(s => s.zoneId === selectedZoneId)
            : selectedAreaId
                ? sites.filter(s => s.areaId === selectedAreaId)
                : [];

    const getAreaMetrics = (areaId: string, employeeId?: string) => {
        const areaZones = zones.filter(z => z.areaId === areaId);
        const areaSites = sites.filter(s => s.areaId === areaId);
        const areaZoneIds = areaZones.map(z => z.id);
        const areaSectors = sectors.filter(s => areaZoneIds.includes(s.zoneId));
        const responsible = employees.find(e => e.id === employeeId)?.fullName || t("messages.noResponsible");

        return {
            zones: areaZones.length,
            sites: areaSites.length,
            sectors: areaSectors.length,
            responsible
        };
    };

    const getZoneMetrics = (zoneId: string) => {
        const zoneSectors = sectors.filter(s => s.zoneId === zoneId);
        const zoneSites = sites.filter(s => s.zoneId === zoneId);
        return { sectors: zoneSectors.length, sites: zoneSites.length };
    };

    const getSectorMetrics = (sectorId: string) => {
        const sectorSites = sites.filter(s => s.sectorId === sectorId);
        return { sites: sectorSites.length };
    };

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 h-full min-h-[500px] md:h-[calc(100vh-200px)]" aria-label="Organizational Kanban View">
            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={t(itemToDelete?.type === 'AREA' ? 'deleteModal.titleArea' : itemToDelete?.type === 'ZONE' ? 'deleteModal.titleZone' : 'deleteModal.titleSector')}
                message={`${t(itemToDelete?.type === 'AREA' ? 'deleteModal.messageArea' : itemToDelete?.type === 'ZONE' ? 'deleteModal.messageZone' : 'deleteModal.messageSector')} "${itemToDelete?.name}". ${t('deleteModal.confirmMessage')}`}
            />

            <AreaColumn
                areas={areas}
                isLoading={isLoadingAreas}
                selectedAreaId={selectedAreaId}
                onSelect={(id) => {
                    setSelectedAreaId(id);
                    setSelectedZoneId(null);
                    setSelectedSectorId(null);
                }}
                onAdd={() => onAdd({ type: "AREA" })}
                onEdit={(area) => onAdd({ ...area, type: "AREA" })}
                getMetrics={getAreaMetrics}
            />

            <ZoneColumn
                zones={filteredZones}
                isLoading={isLoadingZones}
                selectedZoneId={selectedZoneId}
                parentSelected={!!selectedAreaId}
                onSelect={(id) => {
                    setSelectedZoneId(id);
                    setSelectedSectorId(null);
                }}
                onAdd={() => onAdd({ type: "ZONE", areaId: selectedAreaId })}
                onEdit={(zone) => onAdd({ ...zone, type: "ZONE" })}
                getMetrics={getZoneMetrics}
            />

            <SectorColumn
                sectors={filteredSectors}
                isLoading={isLoadingSectors}
                selectedSectorId={selectedSectorId}
                parentSelected={!!selectedAreaId}
                onSelect={setSelectedSectorId}
                onAdd={() => onAdd({ type: "SECTOR", areaId: selectedAreaId, zoneId: selectedZoneId })}
                onEdit={(sector) => {
                    const zone = zones.find(z => z.id === sector.zoneId);
                    onAdd({ ...sector, type: "SECTOR", areaId: zone?.areaId });
                }}
                onDelete={(e, id, name) => handleDelete(e, "SECTOR", id, name)}
                getMetrics={getSectorMetrics}
            />

            <SiteColumn
                sites={filteredSites}
                isLoading={isLoadingSites}
                parentSelected={!!selectedAreaId}
            />
        </section>
    );
}
