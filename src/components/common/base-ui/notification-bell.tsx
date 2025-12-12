"use client";
import React, { useMemo, useState } from "react";
import { Bell, Funnel, SortDescending, Check, Warning } from "phosphor-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  severity: "critical" | "info" | "warning";
  isRead: boolean;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Bem-vindo à sua caixa de entrada de notificações!",
      description:
        "Este é o seu novo destino para atualizações importantes da conta e recomendações personalizadas.",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      severity: "critical",
      isRead: false,
    },
  ]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  function markAsRead(id: string) {
    setNotifications((curr) =>
      curr.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  function markAsUnread(id: string) {
    setNotifications((curr) =>
      curr.map((n) => (n.id === id ? { ...n, isRead: false } : n))
    );
  }

  function markAllAsRead() {
    setNotifications((curr) => curr.map((n) => ({ ...n, isRead: true })));
  }

  function formatRelativeHours(date: Date) {
    const diffMs = Date.now() - date.getTime();
    const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
    return `há ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }

  function SeverityBadge({
    severity,
  }: {
    severity: NotificationItem["severity"];
  }) {
    const map: Record<
      NotificationItem["severity"],
      { label: string; className: string }
    > = {
      critical: { label: "Crítico", className: "bg-red-600 text-white" },
      warning: { label: "Atenção", className: "bg-amber-500 text-black" },
      info: { label: "Info", className: "bg-blue-600 text-white" },
    };
    const { label, className } = map[severity];
    return (
      <span
        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${className}`}
      >
        {label}
      </span>
    );
  }

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <div className="relative border rounded-full p-2 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer group">
          <Bell className="size-4 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </div>
      </DrawerTrigger>
      <DrawerContent className="bg-white dark:bg-slate-950">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DrawerTitle>Notificações</DrawerTitle>
              <DrawerDescription>
                Você tem {unreadCount} notificações não lidas
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Funnel className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrar</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Todos</DropdownMenuItem>
                  <DropdownMenuItem>Críticos</DropdownMenuItem>
                  <DropdownMenuItem>Atenção</DropdownMenuItem>
                  <DropdownMenuItem>Info</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <SortDescending className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllAsRead}
                className="gap-2 cursor-pointer "
              >
                <Check className="h-4 w-4" /> Marcar todas como lidas
              </Button>
            </div>
          </div>
        </DrawerHeader>
        <Separator />
        <div className="p-4">
          <Tabs defaultValue="unread">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unread">
                Não lidas ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="read">Lidas</TabsTrigger>
            </TabsList>
            <TabsContent value="unread" className="mt-4">
              <div className="h-[60vh] pr-4 overflow-y-auto">
                <div className="space-y-4">
                  {notifications
                    .filter((n) => !n.isRead)
                    .map((n) => (
                      <div key={n.id} className="rounded-lg border bg-card p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-2">
                            <Warning className="h-4 w-4 text-red-600 mt-1" />
                            <div>
                              <div className="flex items-center gap-2">
                                <SeverityBadge severity={n.severity} />
                                <p className="text-sm text-muted-foreground">
                                  {formatRelativeHours(n.createdAt)}
                                </p>
                              </div>
                              <h3 className="mt-1 text-sm font-semibold leading-5">
                                {n.title}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {n.description}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="link"
                            className="px-0"
                            onClick={() => markAsRead(n.id)}
                          >
                            Marcar como lido
                          </Button>
                        </div>
                      </div>
                    ))}
                  {unreadCount === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Sem notificações não lidas.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="read" className="mt-4">
              <div className="h-[60vh] pr-4 overflow-y-auto">
                <div className="space-y-4">
                  {notifications
                    .filter((n) => n.isRead)
                    .map((n) => (
                      <div
                        key={n.id}
                        className="rounded-lg border bg-card p-4 opacity-80"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-2">
                            <Warning className="h-4 w-4 text-muted-foreground mt-1" />
                            <div>
                              <div className="flex items-center gap-2">
                                <SeverityBadge severity={n.severity} />
                                <p className="text-sm text-muted-foreground">
                                  {formatRelativeHours(n.createdAt)}
                                </p>
                              </div>
                              <h3 className="mt-1 text-sm font-semibold leading-5">
                                {n.title}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {n.description}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="link"
                            className="px-0"
                            onClick={() => markAsUnread(n.id)}
                          >
                            Marcar como não lida
                          </Button>
                        </div>
                      </div>
                    ))}
                  {notifications.filter((n) => n.isRead).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Nenhuma notificação lida ainda.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default NotificationBell;
