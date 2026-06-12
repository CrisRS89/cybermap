export function AppTopbar() {
  return (
    <header className="flex items-center justify-between border-b border-cyan-400/10 bg-slate-950/40 px-8 py-5 backdrop-blur">
      <div>
        <p className="text-sm text-cyan-300">Dashboard</p>
        <h2 className="text-2xl font-semibold">CyberMap Control Center</h2>
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
  );
}
