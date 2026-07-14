"use client";

import { settingsNavigationItems } from "../settings-navigation";
import { useI18n } from "@/lib/useI18n";

const sectionTranslationKeys: Record<string, string> = {
  appearance: "appearance",
  language: "language",
  "ai-providers": "aiProviders",
  agents: "agents",
  mcp: "mcp",
  connectors: "connectors",
  security: "security",
};

export function SettingsNav() {
  const { t } = useI18n();

  return (
    <aside className="rounded-3xl border border-cyan-400/10 bg-slate-950/55 p-4 shadow-2xl shadow-cyan-950/20 lg:sticky lg:top-6">
      <p className="px-2 text-xs uppercase tracking-[0.25em] text-cyan-300/70">
        Sections
      </p>

      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {settingsNavigationItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="min-w-fit rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
          >
            <span className="block text-sm font-medium text-slate-100">
              {t(
                `settings.sections.${sectionTranslationKeys[item.id]}`,
                item.label
              )}
            </span>
            <span className="mt-1 hidden text-xs text-slate-500 lg:block">
              {item.description}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
