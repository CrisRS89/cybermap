"use client";

import { useI18n } from "@/lib/useI18n";

type SettingsSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function SettingsSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: SettingsSectionProps) {
  const { t } = useI18n();
  const translationKey = id === "ai-providers" ? "aiProviders" : id;

  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-3xl border border-cyan-400/10 bg-slate-950/55 p-5 shadow-2xl shadow-cyan-950/20 sm:p-6"
    >
      <p className="text-sm text-cyan-300">
        {t(`settings.sections.${translationKey}`, eyebrow)}
      </p>
      <h2 className="mt-1 text-xl font-semibold text-slate-100">
        {t(`settings.sections.${translationKey}Title`, title)}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {t(`settings.sections.${translationKey}Desc`, description)}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
