import { recentEvents } from "@/data/dashboard-data";

export function RecentEvents() {
  return (
    <section className="rounded-3xl border border-cyan-400/10 bg-slate-950/55 p-4 sm:p-6">
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
  );
}
