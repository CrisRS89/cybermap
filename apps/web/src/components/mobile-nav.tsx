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

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-cyan-400/10 bg-slate-950/80 px-4 py-4 backdrop-blur lg:hidden">
      <div className="mb-3 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-2xl border border-transparent p-1 transition hover:border-cyan-400/20 hover:bg-cyan-400/5"
          aria-label="Volver al Dashboard"
        >
          <Image
            src="/brand/cybermap-shield.png"
            alt="CyberMap logo"
            width={38}
            height={52}
            priority
            className="h-10 w-auto drop-shadow-[0_0_14px_rgba(34,211,238,0.35)]"
          />

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
              CyberMap
            </p>
            <h1 className="text-lg font-semibold text-slate-100">
              Security Ops
            </h1>
          </div>
        </Link>

        <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
          Local
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {navigationItems.map((item) => {
          const isActive = isNavigationItemActive(pathname, item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs transition ${
                isActive
                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                  : "border-slate-800 bg-slate-900/40 text-slate-400"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
