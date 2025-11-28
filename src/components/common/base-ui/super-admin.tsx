"use client";

import * as React from "react";
import {
    Buildings,
    Package,
    Cube,
    Users,
    TrendUp,
    TrendDown,
    Minus,
    Warning,
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

interface SystemMetric {
    id: string;
    label: string;
    value: string;
    helper: string;
    icon: React.ComponentType<any>;
    iconColor: string;
    iconBg: string;
    actionLabel: string;
}

interface SystemSnapshot {
    id: string;
    label: string;
    value: string;
    helper: string;
    trend: "up" | "down" | "flat";
    delta: string;
    icon: React.ComponentType<any>;
    color: string;
}

// Métricas principais do sistema
const systemMetrics: SystemMetric[] = [
    {
        id: "companies",
        label: "Total de Empresas",
        value: "47",
        helper: "Empresas ativas no sistema",
        icon: Buildings,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100 dark:bg-blue-950",
        actionLabel: "Gerenciar",
    },
    {
        id: "modules",
        label: "Módulos Ativos",
        value: "12",
        helper: "Módulos disponíveis",
        icon: Cube,
        iconColor: "text-purple-600",
        iconBg: "bg-purple-100 dark:bg-purple-950",
        actionLabel: "Ver módulos",
    },
    {
        id: "total-users",
        label: "Usuários Totais",
        value: "1,847",
        helper: "Usuários em todas empresas",
        icon: Users,
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-100 dark:bg-emerald-950",
        actionLabel: "Ver usuários",
    },
];

// Snapshots do sistema
const systemSnapshots: SystemSnapshot[] = [
    {
        id: "new-companies",
        label: "Novas Empresas",
        value: "8",
        helper: "Este mês",
        trend: "up",
        delta: "+23.5%",
        icon: Buildings,
        color: "text-blue-600",
    },
    {
        id: "active-services",
        label: "Serviços Ativos",
        value: "8,942",
        helper: "Total este mês",
        trend: "up",
        delta: "+15.8%",
        icon: Package,
        color: "text-emerald-600",
    },
    {
        id: "system-alerts",
        label: "Alertas do Sistema",
        value: "3",
        helper: "Requerem atenção",
        trend: "down",
        delta: "-40.0%",
        icon: Warning,
        color: "text-amber-600",
    },
];

// Dados de crescimento mensal
const monthlyGrowthData = [
    { month: "Jan", companies: 32, users: 1240, services: 5420 },
    { month: "Fev", companies: 35, users: 1380, services: 6120 },
    { month: "Mar", companies: 38, users: 1520, services: 6840 },
    { month: "Abr", companies: 40, users: 1640, services: 7280 },
    { month: "Mai", companies: 42, users: 1720, services: 7650 },
    { month: "Jun", companies: 44, users: 1780, services: 8120 },
    { month: "Jul", companies: 45, users: 1810, services: 8480 },
    { month: "Ago", companies: 47, users: 1847, services: 8942 },
];

const growthChartConfig: ChartConfig = {
    companies: {
        label: "Empresas",
        color: "hsl(217 91% 60%)",
    },
    users: {
        label: "Usuários",
        color: "hsl(142 76% 50%)",
    },
    services: {
        label: "Serviços",
        color: "hsl(280 83% 65%)",
    },
};

export function SuperAdminDashboard() {
    return (
        <section className="flex w-full flex-col gap-6">
            <SystemMetricsSection />

            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <GrowthTrendsCard />
                <SystemSnapshotCard />
            </div>
        </section>
    );
}

function SystemMetricsSection() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {systemMetrics.map((metric) => (
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

function GrowthTrendsCard() {
    const [metric, setMetric] = React.useState<"companies" | "users" | "services">("companies");

    return (
        <Card>
            <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between pb-3">
                <div>
                    <CardTitle className="text-lg">Crescimento do Sistema</CardTitle>
                    <CardDescription className="text-xs">
                        Evolução de empresas, usuários e serviços
                    </CardDescription>
                </div>
                <Tabs value={metric} onValueChange={(v) => setMetric(v as any)}>
                    <TabsList>
                        <TabsTrigger value="companies" className="text-xs">Empresas</TabsTrigger>
                        <TabsTrigger value="users" className="text-xs">Usuários</TabsTrigger>
                        <TabsTrigger value="services" className="text-xs">Serviços</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="pt-0">
                <ChartContainer config={growthChartConfig} className="h-[280px] w-full">
                    <LineChart data={monthlyGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
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
                            dataKey={metric}
                            type="monotone"
                            stroke={`var(--color-${metric})`}
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

function SystemSnapshotCard() {
    return (
        <Card className="h-fit">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resumo do Sistema</CardTitle>
                <CardDescription className="text-xs">Indicadores principais</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
                {systemSnapshots.map((stat, index) => (
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
                        {index < systemSnapshots.length - 1 && <Separator />}
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
