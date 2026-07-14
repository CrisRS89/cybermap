"use client";

import { useCyberMapSettings } from "@/features/settings/use-cybermap-settings";
import { useI18n } from "@/lib/useI18n";

export function AppTopbar() {
  const { t } = useI18n();
  const settings = useCyberMapSettings();

  return (
    <header className="flex flex-col gap-4 border-b border-cyan-400/10 bg-slate-950/40 px-4 py-5 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div>
        <p className="text-sm text-cyan-300">{t("nav.dashboard")}</p>
        <h2 className="text-xl font-semibold sm:text-2xl">
          {t("dashboard.title")}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">
          Local
        </span>
        <span className="rounded-full border border-slate-700 px-3 py-1">
          {settings.language}
        </span>
        <span className="rounded-full border border-slate-700 px-3 py-1">
          {settings.theme}
        </span>
      </div>
    </header>
  );
}
