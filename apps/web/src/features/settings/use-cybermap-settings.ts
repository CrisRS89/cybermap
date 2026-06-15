"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  parseSettings,
  readServerSettingsRawSnapshot,
  readSettingsRawSnapshot,
  subscribeToSettingsChanges,
} from "./settings-storage";

export function useCyberMapSettings() {
  const rawSettings = useSyncExternalStore(
    subscribeToSettingsChanges,
    readSettingsRawSnapshot,
    readServerSettingsRawSnapshot
  );

  return useMemo(() => parseSettings(rawSettings), [rawSettings]);
}
