type SettingsSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function SettingsSection({
  eyebrow,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="rounded-3xl border border-cyan-400/10 bg-slate-950/55 p-5 shadow-2xl shadow-cyan-950/20 sm:p-6">
      <p className="text-sm text-cyan-300">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-100">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
