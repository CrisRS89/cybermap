import { agentStatuses } from "@/data/dashboard-data";

export function StatusPanel() {
  return (
    <aside className="space-y-6">
      <section className="rounded-3xl border border-cyan-400/10 bg-slate-950/55 p-4 sm:p-6">
        <p className="text-sm text-cyan-300">Settings</p>
        <h3 className="mt-1 text-xl font-semibold">
          Configuración pendiente
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Definir proveedores de IA, agentes, MCP, conectores, idioma, tema y
          fondo del dashboard.
        </p>

        <div className="mt-5 space-y-3">
          {agentStatuses.map((agent) => (
            <div
              key={agent.name}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm"
            >
              <span>{agent.name}</span>
              <span className="shrink-0 text-amber-200">{agent.state}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-400/10 bg-emerald-400/5 p-4 sm:p-6">
        <p className="text-sm text-emerald-300">Blue Team</p>
        <h3 className="mt-1 text-xl font-semibold">
          Priorización defensiva
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          El módulo Blue Team correlacionará activos, servicios, CVE, criticidad
          y recomendaciones de remediación.
        </p>
      </section>

      <section className="rounded-3xl border border-rose-400/10 bg-rose-400/5 p-4 sm:p-6">
        <p className="text-sm text-rose-300">Red Team</p>
        <h3 className="mt-1 text-xl font-semibold">
          Validación controlada
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Las rutas de ataque serán teóricas o requerirán aprobación humana,
          scope autorizado y auditoría.
        </p>
      </section>
    </aside>
  );
}
