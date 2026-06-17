"use client";

import type { SettingsSyncStatus } from "../settings-contract";
import { useSettingsSyncStatus } from "../use-cybermap-settings";

type SyncStatusViewModel = {
  label: string;
  description: string;
  className: string;
};

const STATUS_VIEW_MODEL: Record<SettingsSyncStatus, SyncStatusViewModel> = {
  local: {
    label: "Local",
    description: "Los settings están guardados localmente.",
    className: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  },
  syncing: {
    label: "Sincronizando",
    description: "Enviando cambios al backend.",
    className: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  },
  synced: {
    label: "Sincronizado",
    description: "La última sincronización con el backend fue correcta.",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },
  error: {
    label: "Error de sincronización",
    description: "No se pudo sincronizar con el backend.",
    className: "border-red-400/30 bg-red-400/10 text-red-200",
  },
};

export function SettingsSyncStatusBadge() {
  const syncStatus = useSettingsSyncStatus();
  const viewModel = STATUS_VIEW_MODEL[syncStatus];

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${viewModel.className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium">
          Estado de sincronización: {viewModel.label}
        </span>
        <span className="text-xs opacity-80">{syncStatus}</span>
      </div>
      <p className="mt-1 text-xs opacity-80">{viewModel.description}</p>
    </div>
  );
}
