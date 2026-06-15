"use client";

import { useCyberMapSettings } from "@/features/settings/use-cybermap-settings";

const themeClasses: Record<string, string> = {
  "Dark Pro":
    "bg-[radial-gradient(circle_at_top_left,#14313a_0,#091116_38%,#05080c_100%)] text-slate-100",
  Dracula:
    "bg-[radial-gradient(circle_at_top_left,#4c1d95_0,#111827_45%,#05050a_100%)] text-violet-50",
  "Hacking Green":
    "bg-[radial-gradient(circle_at_top_left,#064e3b_0,#020617_45%,#000000_100%)] text-emerald-50",
  "Claude Warm":
    "bg-[radial-gradient(circle_at_top_left,#7c2d12_0,#292524_45%,#120a05_100%)] text-orange-50",
};

const backgroundClasses: Record<string, string> = {
  Nodos:
    "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_80%_15%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_85%,rgba(16,185,129,0.10),transparent_20%)] before:pointer-events-none",
  Cuadrícula:
    "before:absolute before:inset-0 before:bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] before:bg-[size:32px_32px] before:pointer-events-none",
  Puntos:
    "before:absolute before:inset-0 before:bg-[radial-gradient(circle,rgba(148,163,184,0.16)_1px,transparent_1px)] before:bg-[size:22px_22px] before:pointer-events-none",
  Ninguno: "",
};

type AppThemeShellProps = {
  children: React.ReactNode;
};

export function AppThemeShell({ children }: AppThemeShellProps) {
  const settings = useCyberMapSettings();

  const themeClass = themeClasses[settings.theme] ?? themeClasses["Dark Pro"];
  const backgroundClass =
    backgroundClasses[settings.background] ?? backgroundClasses.Nodos;

  return (
    <div className={`relative min-h-screen overflow-hidden ${themeClass} ${backgroundClass}`}>
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
