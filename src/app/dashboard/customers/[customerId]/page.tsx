"use client";

import { type ReactNode, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AtSign,
  CalendarDays,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SitesTable } from "@/components/common/dashboard/sites/sites-table";
import { EquipmentTable } from "@/components/common/dashboard/equipment/equipment-table";
import { CarsTable } from "@/components/common/dashboard/cars/cars-table";
import { EmployeesTable } from "@/components/common/dashboard/employees/employees-table";
import { useCustomerById } from "@/infrastructure/hooks/useCustomers";
import { useSitesByCompanyAndCustomer } from "@/infrastructure/hooks/useSites";
import Image from "next/image";

export default function CustomerDetailsPage() {
  const params = useParams<{ customerId: string }>();
  const router = useRouter();
  const customerId = params?.customerId ?? "";

  const { data: customer, isLoading: isLoadingCustomer } = useCustomerById(customerId);
  const {
    data: customerSites = [],
    isLoading: isLoadingSites,
  } = useSitesByCompanyAndCustomer(customer?.companyId, customerId, {
    enabled: Boolean(customer?.companyId),
  });

  const equipmentFromSites = useMemo(
    () => customerSites.flatMap((site) => site.equipments ?? []),
    [customerSites],
  );

  const employeesFromSites = useMemo(
    () => customerSites.flatMap((site) => site.employees ?? []),
    [customerSites],
  );

  const carsFromSites = useMemo(
    () => customerSites.flatMap((site) => site.cars ?? []),
    [customerSites],
  );

  const siteIds = useMemo(
    () => customerSites.map((site) => site.id).filter(Boolean) as string[],
    [customerSites],
  );

  const isLoadingEquipment = isLoadingSites;
  const isLoadingCars = isLoadingSites;
  const isLoadingEmployees = isLoadingSites;

  const companyLabel = customer?.company?.businessName ?? customer?.name ?? "--";
  const companyCode = customer?.cod ? `Cod ${customer.cod}` : "--";
  const photoSrc = customer?.photo && customer.photo.trim().length > 0 ? customer.photo : "";
  const addressSummary =
    [customer?.address?.houseHold, customer?.address?.municipality, customer?.address?.province]
      .filter(Boolean)
      .join(", ") || "Endereço não informado";
  const email = customer?.contact?.email ?? "Email não informado";

  const customerCars = carsFromSites;
  const customerEmployees = employeesFromSites;

  if (isLoadingCustomer) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-20" />

        <section className="grid md:grid-cols-2 md:gap-8 gap-6 bg-white p-6">
          <Card className="border-none bg-transparent shadow-none">
            <CardHeader className="space-y-6 p-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Skeleton className="h-24 w-24 md:h-36 md:w-36 rounded-full" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-none bg-transparent shadow-none">
            <CardContent className="grid gap-4 sm:grid-cols-2 p-0">
              <div className="text-center">
                <Skeleton className="h-4 w-16 mx-auto mb-2" />
                <Skeleton className="h-8 w-12 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-4 w-24 mx-auto mb-2" />
                <Skeleton className="h-8 w-12 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-4 w-16 mx-auto mb-2" />
                <Skeleton className="h-8 w-12 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-4 w-24 mx-auto mb-2" />
                <Skeleton className="h-8 w-12 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="space-y-4">
          <Skeleton className="h-10 w-96" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Badge variant="destructive">Cliente não encontrado</Badge>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Não conseguimos localizar este cliente. Verifique o link ou retorne à listagem para tentar novamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const createdAt = customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("pt-BR") : "--";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 w-fit cursor-pointer">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <section className="grid md:grid-cols-2 md:gap-8 gap-6 bg-white p-6 rounded-lg">
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="space-y-6 p-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-24 w-24 md:size-36 overflow-hidden rounded-full border border-border bg-muted">
                <Image
                  src={photoSrc}
                  alt={`Foto de ${customer.name}`}
                  width={150}
                  height={150}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl text-foreground">{companyLabel}</CardTitle>
                  <p className="text-sm text-muted-foreground font-semibold">{companyCode}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Criado em {createdAt}
                  </span>
                </div>
                <DetailItem icon={<AtSign className="h-4 w-4 text-primary" />} label="Email" value={email} />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-none bg-transparent shadow-none">
          <CardContent className="grid gap-4 sm:grid-cols-2 p-0">
            <SummaryStat label="Sites" value={customerSites.length} isLoading={isLoadingSites} />
            <SummaryStat label="Equipamentos" value={equipmentFromSites.length} isLoading={isLoadingEquipment} />
            <SummaryStat label="Veículos" value={customerCars.length} isLoading={isLoadingCars} />
            <SummaryStat label="Funcionários" value={customerEmployees.length} isLoading={isLoadingEmployees} />
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="sites" className="space-y-4">
        <TabsList className="w-full justify-start overflow-auto">
          <TabsTrigger value="sites" className="cursor-pointer">Sites</TabsTrigger>
          <TabsTrigger value="equipment" className="cursor-pointer">Equipamentos</TabsTrigger>
          <TabsTrigger value="cars" className="cursor-pointer">Veículos</TabsTrigger>
          <TabsTrigger value="employees" className="cursor-pointer">Funcionários</TabsTrigger>
        </TabsList>

        <TabsContent value="sites">
          <SitesTable customerId={customer.id} data={customerSites} isLoadingOverride={isLoadingSites} />
        </TabsContent>

        <TabsContent value="equipment">
          <EquipmentTable customerId={customer.id} data={equipmentFromSites} isLoadingOverride={isLoadingSites} />
        </TabsContent>

        <TabsContent value="cars">
          <CarsTable companyId={customer.companyId} data={customerCars} isLoadingOverride={isLoadingSites} />
        </TabsContent>

        <TabsContent value="employees">
          <EmployeesTable
            companyId={customer.companyId}
            siteIds={siteIds}
            data={customerEmployees}
            isLoadingOverride={isLoadingSites}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SummaryStatProps {
  label: string;
  value: number | string;
  isLoading?: boolean;
}

function SummaryStat({ label, value, isLoading }: SummaryStatProps) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      {isLoading ? (
        <Skeleton className="mx-auto mt-2 h-8 w-12" />
      ) : (
        <p className="text-2xl font-bold text-foreground">{value}</p>
      )}
    </div>
  );
}

interface DetailItemProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="space-y-1 p-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        {icon}
        {value}
      </p>
    </div>
  );
}