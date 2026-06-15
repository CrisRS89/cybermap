import { SettingsForm } from "@/features/settings/components/settings-form";

export default function SettingsPage() {
  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-semibold">
          Configuración de CyberMap
        </h1>
        <SettingsForm />
      </section>
    </main>
  );
}
