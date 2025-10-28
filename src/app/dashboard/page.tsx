

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
       
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground p-6 min-h-24 lg:col-span-2 card-modern hover-lift">
          <h3 className="text-lg font-semibold mb-2">Visão Geral</h3>
          <p className="text-muted-foreground">Resumo das atividades recentes</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground p-6 min-h-24 card-modern hover-lift">
          <h3 className="text-lg font-semibold mb-2">Status</h3>
          <p className="text-muted-foreground">Sistema operacional</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground p-6 min-h-[28rem] xl:col-span-2 card-modern">
          <h3 className="text-lg font-semibold mb-4">Gráfico Principal</h3>
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Área para gráficos e visualizações
          </div>
        </div>
        <div className="flex flex-col gap-4 xl:col-span-1">
          <div className="rounded-xl border bg-card text-card-foreground p-6 min-h-48 card-modern hover-lift">
            <h4 className="font-semibold mb-2">Atividades</h4>
            <p className="text-muted-foreground text-sm">Lista de atividades recentes</p>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground p-6 min-h-48 card-modern hover-lift">
            <h4 className="font-semibold mb-2">Notificações</h4>
            <p className="text-muted-foreground text-sm">Alertas e notificações</p>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground p-6 min-h-48 card-modern hover-lift">
            <h4 className="font-semibold mb-2">Estatísticas</h4>
            <p className="text-muted-foreground text-sm">Métricas importantes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground p-6 min-h-48 card-modern hover-lift">
          <h4 className="font-semibold mb-2">Relatórios</h4>
          <p className="text-muted-foreground text-sm">Relatórios e análises</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground p-6 min-h-48 card-modern hover-lift">
          <h4 className="font-semibold mb-2">Configurações</h4>
          <p className="text-muted-foreground text-sm">Configurações do sistema</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground p-6 min-h-48 card-modern hover-lift">
          <h4 className="font-semibold mb-2">Suporte</h4>
          <p className="text-muted-foreground text-sm">Central de ajuda</p>
        </div>
      </div>
    </div>
  )
}
