export function AttackSurfacePanel() {
  return (
    <section className="rounded-3xl border border-cyan-400/10 bg-slate-950/55 p-6 shadow-2xl shadow-cyan-950/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-cyan-300">Exploration</p>
          <h3 className="text-xl font-semibold">Attack Surface Map</h3>
        </div>
        <button className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
          Importar escaneo
        </button>
      </div>

      <div className="mt-6 grid h-[380px] place-items-center rounded-2xl border border-dashed border-cyan-400/20 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:32px_32px]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_60px_rgba(34,211,238,0.25)]" />
          <p className="text-lg font-medium">Sin datos de escaneo cargados</p>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Importá un XML de Nmap o conectá un scanner para comenzar a construir
            el mapa visual.
          </p>
        </div>
      </div>
    </section>
  );
}
