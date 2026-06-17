"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getSettingsSyncStatus,
  parseSettings,
  readServerSettingsRawSnapshot,
  readSettingsRawSnapshot,
  subscribeToSettingsChanges,
  subscribeToSettingsSyncStatusChanges,
} from "./settings-storage";

/**
 * Hook principal para leer settings parseados desde localStorage.
 *
 * Propósito:
 * - Mantener una API simple para consumidores que solo necesitan settings.
 * - Evitar mezclar estado de datos con estado de sincronización.
 */
export function useCyberMapSettings() {
  const rawSettings = useSyncExternalStore(
    subscribeToSettingsChanges,
    readSettingsRawSnapshot,
    readServerSettingsRawSnapshot
  );

  return useMemo(() => parseSettings(rawSettings), [rawSettings]);
}

/**
 * Hook dedicado para observar el estado de sincronización frontend-backend.
 *
 * Estados posibles:
 * - local: API no configurada o estado inicial local.
 * - syncing: sincronización en curso.
 * - synced: última sincronización correcta.
 * - error: última sincronización fallida.
 */
export function useSettingsSyncStatus() {
  return useSyncExternalStore(
    subscribeToSettingsSyncStatusChanges,
    getSettingsSyncStatus,
    getSettingsSyncStatus
  );
}
