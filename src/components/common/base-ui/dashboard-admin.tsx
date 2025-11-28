"use client";

import * as React from "react";
import {
  Buildings,
  Package,
  Truck,
  Users,
  MapPin,
  Warning,
  TrendUp,
  TrendDown,
  Minus,
  FileText,
  CheckCircle,
} from "phosphor-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

interface MetricDescriptor {
  id: string;
  label: string;
  value: string;
  helper: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  iconBg: string;
  actionLabel: string;
}

interface OperationalSnapshot {
  id: string;
  label: string;
  value: string;
  helper: string;
  trend: "up" | "down" | "flat";
  delta: string;
  icon: React.ComponentType<any>;
  color: string;
}

// Métricas para Admin Local (Empresa)
const localMetricCards: MetricDescriptor[] = [
  {
    id: "sites",
    label: "Sites Ativos",
    value: "38",
    helper: "Sites da sua empresa",
    icon: MapPin,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100 dark:bg-purple-950",
    actionLabel: "Ver sites",
  },
  {
    id: "services",
    label: "Serviços do Mês",
    value: "1,247",
    helper: "RSU, Supervisões e Ocorrências",
    icon: Package,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100 dark:bg-emerald-950",
    actionLabel: "Ver detalhes",
  },
  {
    id: "fleet",
    label: "Frota Ativa",
    value: "24",
    helper: "Veículos e contentores",
    icon: Truck,
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-100 dark:bg-cyan-950",
    actionLabel: "Ver frota",
  },
  {
    id: "employees",
    label: "Funcionários",
    value: "156",
    helper: "Colaboradores ativos",
    icon: Users,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100 dark:bg-orange-950",
    actionLabel: "Ver equipe",
  },
];

// Snapshots operacionais para Admin Local (removed "Serviços Pendentes")
const operationalStats: OperationalSnapshot[] = [
  {
    id: "rsu-completed",
    label: "RSU Concluídos",
    value: "847",
    helper: "Este mês",
    trend: "up",
    delta: "+12.5%",
    icon: CheckCircle,
    color: "text-emerald-600",
  },
  {
    id: "supervisions",
    label: "Supervisões",
    value: "234",
    helper: "Este mês",
    trend: "up",
    delta: "+8.2%",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    id: "occurrences",
    label: "Ocorrências",
    value: "18",
    helper: "Últimos 7 dias",
    trend: "down",
    delta: "-15.3%",
    icon: Warning,
    color: "text-amber-600",
  },
];

// Dados diários (24 horas)
const dailyRsuData = [
  { hour: "00h", value: 5 },
  { hour: "01h", value: 3 },
  { hour: "02h", value: 2 },
  { hour: "03h", value: 1 },
  { hour: "04h", value: 4 },
  { hour: "05h", value: 8 },
  { hour: "06h", value: 15 },
  { hour: "07h", value: 22 },
  { hour: "08h", value: 28 },
  { hour: "09h", value: 32 },
  { hour: "10h", value: 35 },
  { hour: "11h", value: 30 },
  { hour: "12h", value: 25 },
  { hour: "13h", value: 28 },
  { hour: "14h", value: 33 },
  { hour: "15h", value: 30 },
  { hour: "16h", value: 27 },
  { hour: "17h", value: 24 },
  { hour: "18h", value: 18 },
  { hour: "19h", value: 12 },
  { hour: "20h", value: 8 },
  { hour: "21h", value: 6 },
  { hour: "22h", value: 4 },
  { hour: "23h", value: 3 },
];

const dailySupervisionData = [
  { hour: "00h", value: 0 },
  { hour: "01h", value: 0 },
  { hour: "02h", value: 0 },
  { hour: "03h", value: 0 },
  { hour: "04h", value: 1 },
  { hour: "05h", value: 2 },
  { hour: "06h", value: 4 },
  { hour: "07h", value: 6 },
  { hour: "08h", value: 8 },
  { hour: "09h", value: 10 },
  { hour: "10h", value: 12 },
  { hour: "11h", value: 9 },
  { hour: "12h", value: 7 },
  { hour: "13h", value: 8 },
  { hour: "14h", value: 11 },
  { hour: "15h", value: 10 },
  { hour: "16h", value: 9 },
  { hour: "17h", value: 7 },
  { hour: "18h", value: 5 },
  { hour: "19h", value: 3 },
  { hour: "20h", value: 2 },
  { hour: "21h", value: 1 },
  { hour: "22h", value: 0 },
  { hour: "23h", value: 0 },
];

const dailyOccurrenceData = [
  { hour: "00h", value: 0 },
  { hour: "01h", value: 0 },
  { hour: "02h", value: 0 },
  { hour: "03h", value: 0 },
  { hour: "04h", value: 0 },
  { hour: "05h", value: 1 },
  { hour: "06h", value: 1 },
  { hour: "07h", value: 2 },
  { hour: "08h", value: 3 },
  { hour: "09h", value: 2 },
  { hour: "10h", value: 3 },
  { hour: "11h", value: 2 },
  { hour: "12h", value: 1 },
  { hour: "13h", value: 2 },
  { hour: "14h", value: 3 },
  { hour: "15h", value: 2 },
  { hour: "16h", value: 2 },
  { hour: "17h", value: 1 },
  { hour: "18h", value: 1 },
  { hour: "19h", value: 0 },
  { hour: "20h", value: 0 },
  { hour: "21h", value: 0 },
  { hour: "22h", value: 0 },
  { hour: "23h", value: 0 },
];

// Dados semanais (7 dias)
const weeklyRsuData = [
  { day: "Seg", value: 142 },
  { day: "Ter", value: 156 },
  { day: "Qua", value: 148 },
  { day: "Qui", value: 165 },
  { day: "Sex", value: 152 },
  { day: "Sáb", value: 98 },
  { day: "Dom", value: 76 },
];

const weeklySupervisionData = [
  { day: "Seg", value: 38 },
  { day: "Ter", value: 42 },
  { day: "Qua", value: 36 },
  { day: "Qui", value: 45 },
  { day: "Sex", value: 40 },
  { day: "Sáb", value: 22 },
  { day: "Dom", value: 18 },
];

const weeklyOccurrenceData = [
  { day: "Seg", value: 3 },
  { day: "Ter", value: 2 },
  { day: "Qua", value: 4 },
  { day: "Qui", value: 1 },
  { day: "Sex", value: 3 },
  { day: "Sáb", value: 2 },
  { day: "Dom", value: 1 },
];

// Dados mensais (30 dias)
const monthlyRsuData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  value: Math.floor(Math.random() * 40) + 20,
}));

const monthlySupervisionData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  value: Math.floor(Math.random() * 15) + 5,
}));

const monthlyOccurrenceData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  value: Math.floor(Math.random() * 5),
}));

const rsuChartConfig: ChartConfig = {
  value: {
    label: "RSU",
    color: "hsl(142 76% 36%)",
  },
};

const supervisionChartConfig: ChartConfig = {
  value: {
    label: "Supervisões",
    color: "hsl(217 91% 60%)",
  },
};

const occurrenceChartConfig: ChartConfig = {
  value: {
    label: "Ocorrências",
    color: "hsl(38 92% 50%)",
  },
};

export function DashboardAdmin() {
  return (
    <section className="flex w-full flex-col gap-6">
      <MetricSection />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <ServiceTrendsCard />
        <OperationalSnapshotCard />
      </div>
    </section>
  );
}

function MetricSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {localMetricCards.map((metric) => (
        <Card key={metric.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
            <div>
              <CardDescription className="text-sm">{metric.label}</CardDescription>
              <CardTitle className="text-4xl font-bold">{metric.value}</CardTitle>
            </div>
            <div className={cn("rounded p-3 cursor-pointer hover:opacity-80 transition-opacity", metric.iconBg)}>
              <metric.icon className={cn(metric.iconColor)} size={28} weight="duotone" />
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <p className="text-sm text-muted-foreground">{metric.helper}</p>
            <Button variant="link" className="h-auto p-0 text-sm text-primary cursor-pointer hover:underline">
              {metric.actionLabel}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ServiceTrendsCard() {
  const [period, setPeriod] = React.useState<"day" | "week" | "month">("day");

  const getChartData = (serviceType: "rsu" | "supervision" | "occurrence") => {
    if (period === "day") {
      return serviceType === "rsu"
        ? dailyRsuData
        : serviceType === "supervision"
          ? dailySupervisionData
          : dailyOccurrenceData;
    } else if (period === "week") {
      return serviceType === "rsu"
        ? weeklyRsuData
        : serviceType === "supervision"
          ? weeklySupervisionData
          : weeklyOccurrenceData;
    } else {
      return serviceType === "rsu"
        ? monthlyRsuData
        : serviceType === "supervision"
          ? monthlySupervisionData
          : monthlyOccurrenceData;
    }
  };

  const getXAxisKey = () => {
    if (period === "day") return "hour";
    if (period === "week") return "day";
    return "day";
  };

  const getInterval = () => {
    if (period === "day") return 2;
    if (period === "week") return 0;
    return 4;
  };

  return (
    <Card>
      <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between pb-3">
        <div>
          <CardTitle className="text-lg">Serviços</CardTitle>
          <CardDescription className="text-xs">
            Visualize por tipo de serviço
          </CardDescription>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as "day" | "week" | "month")}>
          <TabsList>
            <TabsTrigger value="day" className="text-xs">Dia</TabsTrigger>
            <TabsTrigger value="week" className="text-xs">Semana</TabsTrigger>
            <TabsTrigger value="month" className="text-xs">Mês</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <Tabs defaultValue="rsu">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rsu" className="text-xs">RSU</TabsTrigger>
            <TabsTrigger value="supervision" className="text-xs">Supervisões</TabsTrigger>
            <TabsTrigger value="occurrence" className="text-xs">Ocorrências</TabsTrigger>
          </TabsList>

          <TabsContent value="rsu" className="mt-3">
            <ChartContainer config={rsuChartConfig} className="h-[240px] w-full">
              <LineChart data={getChartData("rsu")}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey={getXAxisKey()}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  interval={getInterval()}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="value"
                  type="monotone"
                  stroke="var(--color-value)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="supervision" className="mt-3">
            <ChartContainer config={supervisionChartConfig} className="h-[240px] w-full">
              <LineChart data={getChartData("supervision")}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey={getXAxisKey()}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  interval={getInterval()}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="value"
                  type="monotone"
                  stroke="var(--color-value)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="occurrence" className="mt-3">
            <ChartContainer config={occurrenceChartConfig} className="h-[240px] w-full">
              <LineChart data={getChartData("occurrence")}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey={getXAxisKey()}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  interval={getInterval()}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="value"
                  type="monotone"
                  stroke="var(--color-value)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function OperationalSnapshotCard() {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Resumo Operacional</CardTitle>
        <CardDescription className="text-xs">Indicadores principais</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {operationalStats.map((stat, index) => (
          <React.Fragment key={stat.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <stat.icon className={cn(stat.color)} size={16} weight="duotone" />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
              </div>
              <div className="text-right">
                <TrendBadge value={stat.delta} trend={stat.trend} />
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.helper}</p>
              </div>
            </div>
            {index < operationalStats.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
}

function TrendBadge({ value, trend }: { value: string; trend: "up" | "down" | "flat" }) {
  const Icon =
    trend === "up" ? TrendUp : trend === "down" ? TrendDown : Minus;
  const tone =
    trend === "up"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
      : trend === "down"
        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";

  return (
    <Badge
      variant="secondary"
      className={cn("flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium", tone)}
    >
      <Icon className={cn(trend === "up" ? "text-emerald-700" : trend === "down" ? "text-red-700" : "text-slate-700")} size={12} weight="bold" />
      {value}
    </Badge>
  );
}
