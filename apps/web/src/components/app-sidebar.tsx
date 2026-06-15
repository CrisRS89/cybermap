"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/data/dashboard-data";

function isNavigationItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r border-cyan-400/10 bg-slate-950/70 px-5 py-6 backdrop-blur lg:block">
      <Link
        href="/"
        className="mb-10 flex items-center gap-3 rounded-2xl border border-transparent p-2 transition hover:border-cyan-400/20 hover:bg-cyan-400/5"
        aria-label="Volver al Dashboard"
      >
        <Image
          src="/brand/cybermap-shield.png"
          alt="CyberMap logo"
          width={52}
          height={72}
          priority
          className="h-14 w-auto drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]"
        />

        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
            CyberMap
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Security Ops
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Plataforma modular de ciberseguridad asistida por IA.
          </p>
        </div>
      </Link>

      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const isActive = isNavigationItemActive(pathname, item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                isActive
                  ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                  : "border border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              }`}
            >
              <span>{item.label}</span>
              <span className="text-xs uppercase text-slate-500">
                {isActive ? "active" : item.status}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
        <p className="text-sm font-medium text-amber-200">Modo seguro activo</p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Los agentes, conectores y escaneos activos requerirán validación
          explícita antes de ejecutarse.
        </p>
      </div>
    </aside>
  );
}
