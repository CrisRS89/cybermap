import Link from "next/link";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { SettingsNav } from "@/features/settings/components/settings-nav";

export default function SettingsPage() {
  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            href="/"
            className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/10"
          >
            ← Volver al Dashboard
          </Link>

          <p className="text-sm text-cyan-300">Settings</p>
          <h1 className="mt-1 text-2xl font-semibold">
            Configuración de CyberMap
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Configura apariencia, idioma, IA, agentes, MCP, conectores y
            políticas de seguridad desde un único centro de control.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <SettingsNav />
          <SettingsForm />
        </div>
      </section>
    </main>
  );
}
