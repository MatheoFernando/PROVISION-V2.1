"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  Users,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerById } from "@/infrastructure/hooks/useCustomers";
import { SitesTable } from "@/components/common/dashboard/sites/sites-table";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CustomerDialog } from "./customer-create";
import { useState } from "react";

function getFirstItem<T>(entity: T | T[] | undefined | null): T | undefined {
  if (!entity) return undefined;
  if (Array.isArray(entity)) {
    return entity[0] || (entity as any);
  }
  return entity as T;
}

export function CustomersView() {
  const params = useParams<{ customerId: string }>();
  const router = useRouter();
  const t = useTranslations();
  const { customerId } = params;

  const { data: customer, isLoading } = useCustomerById(customerId);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);

  if (isLoading) {
    return <CustomerDetailsSkeleton />;
  }

  if (!customer && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <div className="p-4 rounded-full bg-muted/30">
          <Users className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">{t('CustomerDetails.notFound')}</h2>
        <Button onClick={() => router.back()} variant="outline">
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('Common.back')}
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background/50 pb-20">

      <header className="w-full bg-background/60 border-b border-border/40 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex gap-2">
                <h1 className="text-lg font-semibold tracking-tight truncate max-w-[600px]">
                  {customer?.cod}
                </h1>
                <h1 className="text-lg font-semibold tracking-tight truncate max-w-[600px]">
                  {customer?.name}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsEditCustomerOpen(true)}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              <Pencil className="w-4 h-4 mr-2" />
              {t('CustomerDetails.actions.edit') || 'Edit Customer'}
            </Button>
          </div>
        </div>
      </header>

      <CustomerDialog
        open={isEditCustomerOpen}
        onOpenChange={setIsEditCustomerOpen}
        customerToEdit={customer || undefined}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-muted/30 p-1 rounded-full h-12 border border-border/20 backdrop-blur-sm">
              <TabsTrigger value="overview" className="rounded-full px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                {t('CustomerDetails.tabs.overview')}
              </TabsTrigger>
              <TabsTrigger value="sites" className="rounded-full px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                {t('CustomerDetails.tabs.sites')}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/90">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  {t('CustomerDetails.sections.contactDetails')}
                </h3>
                <div className="space-y-3 pt-2">
                  <DetailRow
                    label={t('Customers.fields.email')}
                    value={getFirstItem(customer?.contact ?? (customer as any)?.contacts)?.email}
                    icon={Mail}
                  />
                  <DetailRow
                    label={t('Customers.fields.phone')}
                    value={getFirstItem(customer?.contact ?? (customer as any)?.contacts)?.phoneNumbers?.[0]?.phone || '-'}
                    icon={Phone}
                  />
                  <DetailRow
                    label={t('Customers.fields.address')}
                    value={getFirstItem(customer?.address ?? (customer as any)?.addresses)?.houseHold}
                    icon={MapPin}
                  />
                  <DetailRow label={t('CustomerDetails.fields.commune')} value={getFirstItem(customer?.address ?? (customer as any)?.addresses)?.commune} />
                  <DetailRow label={t('SiteDetails.fields.municipality')} value={getFirstItem(customer?.address ?? (customer as any)?.addresses)?.municipality} />
                  <DetailRow label={t('SiteDetails.fields.province')} value={getFirstItem(customer?.address ?? (customer as any)?.addresses)?.province} />
                  <DetailRow label={t('CustomerDetails.fields.country')} value={getFirstItem(customer?.address ?? (customer as any)?.addresses)?.country} />
                </div>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/90">
                    <Briefcase className="w-5 h-5 text-indigo-500" />
                    {t('CustomerDetails.sections.fiscalInfo')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
                  <DetailRow
                    label={t('Customers.fields.taxName')}
                    value={customer?.taxName}
                    className="py-3 text-base"
                  />
                  <DetailRow
                    label={t('Customers.fields.nif')}
                    value={customer?.nif}
                    className="py-3 text-base"
                    icon={FileText}
                  />
                  <DetailRow
                    label={t('CustomerDetails.fields.companyName')}
                    value={(customer as any)?.company?.businessName || (customer as any)?.company?.taxName || '-'}
                    className="py-3 text-base"
                  />
                  <DetailRow
                    label={t('SiteDetails.fields.createdAt')}
                    value={(customer?.createdAt && new Date(customer.createdAt).getFullYear() > 2000) ? format(new Date(customer.createdAt), 'PP', { locale: ptBR }) : '-'}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sites" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">

            <div >
              <h1 className="text-2xl font-semibold mb-4">{t('Sidebar.sites')}</h1>
              {customerId && (
                <SitesTable
                  customerId={customerId}
                  companyId={(customer as any)?.companyId}
                  shouldNavigateBack={false}
                />
              )}
            </div>

          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function DetailRow({
  label,
  value,
  className,
  icon: Icon
}: {
  label: string,
  value?: string | null,
  className?: string,
  icon?: any
}) {
  if (!value) return null;
  return (
    <div className={cn("flex items-center justify-between py-2 border-b border-border/40 last:border-0", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground/70" />}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

function CustomerDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background/50 pb-20">
      <div className="w-full bg-background/60 border-b border-border/40 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-48 rounded" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="w-full h-12 rounded-full bg-muted/30 border border-border/20 flex items-center p-1 gap-2">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  )
}
