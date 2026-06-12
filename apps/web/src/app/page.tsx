const navigationItems = [
  { label: "Dashboard", status: "active" },
  { label: "Exploration", status: "ready" },
  { label: "Blue Team", status: "ready" },
  { label: "Red Team", status: "locked" },
  { label: "Settings", status: "ready" },
];

const metricCards = [
  {
    label: "Assets detectados",
    value: "0",
    detail: "Esperando importación de escaneos",
  },
  {
    label: "Puertos abiertos",
    value: "0",
    detail: "Sin datos cargados",
  },
  {
    label: "Vulnerabilidades",
    value: "0",
    detail: "CVE pendientes de correlación",
  },
  {
    label: "IA activa",
    value: "No configurada",
    detail: "Configurar proveedor en Settings",
  },
];

const recentEvents = [
  "Repositorio local inicializado",
  "Frontend Next.js creado",
  "Build y lint validados",
  "Pendiente: diseño de módulos CyberMap",
];

const agentStatuses = [
  { name: "AI Gateway", state: "Pendiente" },
  { name: "Agent Hub", state: "Pendiente" },
  { name: "MCP Layer", state: "Pendiente" },
  { name: "Connectors", state: "Pendiente" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#14313a_0,#091116_38%,#05080c_100%)] text-slate-100">
      <div className="grid min-h-screen grid-cols-[280px_1fr]">
        <aside className="border-r border-cyan-400/10 bg-slate-950/70 px-5 py-6 backdrop-blur">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
              CyberMap
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Security Ops
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Plataforma modular de ciberseguridad asistida por IA.
            </p>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                  item.status === "active"
                    ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                    : "border border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                }`}
              >
                <span>{item.label}</span>
                <span className="text-xs uppercase text-slate-500">
                  {item.status}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
            <p className="text-sm font-medium text-amber-200">
              Modo seguro activo
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Los agentes, conectores y escaneos activos requerirán validación
              explícita antes de ejecutarse.
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="flex items-center justify-between border-b border-cyan-400/10 bg-slate-950/40 px-8 py-5 backdrop-blur">
            <div>
              <p className="text-sm text-cyan-300">Dashboard</p>
              <h2 className="text-2xl font-semibold">
                CyberMap Control Center
              </h2>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                Local
              </span>
              <span className="rounded-full border border-slate-700 px-3 py-1">
                ES
              </span>
              <span className="rounded-full border border-slate-700 px-3 py-1">
                Dark Pro
              </span>
            </div>
          </header>

          <div className="grid flex-1 grid-cols-[1fr_340px] gap-6 p-8">
            <div className="space-y-6">
              <section className="grid grid-cols-4 gap-4">
                {metricCards.map((card) => (
                  <article
                    key={card.label}
                    className="rounded-2xl border border-cyan-400/10 bg-slate-950/55 p-5 shadow-2xl shadow-cyan-950/20"
                  >
                    <p className="text-sm text-slate-400">{card.label}</p>
                    <p className="mt-3 text-2xl font-semibold">{card.value}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {card.detail}
                    </p>
                  </article>
                ))}
              </section>

              <section className="rounded-3xl border border-cyan-400/10 bg-slate-950/55 p-6 shadow-2xl shadow-cyan-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyan-300">Exploration</p>
                    <h3 className="text-xl font-semibold">
                      Attack Surface Map
                    </h3>
                  </div>
                  <button className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                    Importar escaneo
                  </button>
                </div>

                <div className="mt-6 grid h-[380px] place-items-center rounded-2xl border border-dashed border-cyan-400/20 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:32px_32px]">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-20 w-20 rounded-full border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_60px_rgba(34,211,238,0.25)]" />
                    <p className="text-lg font-medium">
                      Sin datos de escaneo cargados
                    </p>
                    <p className="mt-2 max-w-md text-sm text-slate-500">
                      Importá un XML de Nmap o conectá un scanner para comenzar
                      a construir el mapa visual.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-cyan-400/10 bg-slate-950/55 p-6">
                <h3 className="text-lg font-semibold">Eventos recientes</h3>
                <div className="mt-4 space-y-3">
                  {recentEvents.map((event) => (
                    <div
                      key={event}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-300"
                    >
                      {event}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-cyan-400/10 bg-slate-950/55 p-6">
                <p className="text-sm text-cyan-300">Settings</p>
                <h3 className="mt-1 text-xl font-semibold">
                  Configuración pendiente
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Definir proveedores de IA, agentes, MCP, conectores, idioma,
                  tema y fondo del dashboard.
                </p>

                <div className="mt-5 space-y-3">
                  {agentStatuses.map((agent) => (
                    <div
                      key={agent.name}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm"
                    >
                      <span>{agent.name}</span>
                      <span className="text-amber-200">{agent.state}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-emerald-400/10 bg-emerald-400/5 p-6">
                <p className="text-sm text-emerald-300">Blue Team</p>
                <h3 className="mt-1 text-xl font-semibold">
                  Priorización defensiva
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  El módulo Blue Team correlacionará activos, servicios, CVE,
                  criticidad y recomendaciones de remediación.
                </p>
              </section>

              <section className="rounded-3xl border border-rose-400/10 bg-rose-400/5 p-6">
                <p className="text-sm text-rose-300">Red Team</p>
                <h3 className="mt-1 text-xl font-semibold">
                  Validación controlada
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Las rutas de ataque serán teóricas o requerirán aprobación
                  humana, scope autorizado y auditoría.
                </p>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
