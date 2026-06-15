import { defaultSettings } from "./settings-options";
import type { CyberMapSettings } from "./settings-types";

export const LOCAL_STORAGE_KEY = "cybermap_settings";
export const STORAGE_EVENT_NAME = "cybermap-settings-change";

const defaultSettingsRaw = JSON.stringify(defaultSettings);

export function readSettingsRawSnapshot(): string {
  if (typeof window === "undefined") {
    return defaultSettingsRaw;
  }

  return window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? defaultSettingsRaw;
}

export function readServerSettingsRawSnapshot(): string {
  return defaultSettingsRaw;
}

export function subscribeToSettingsChanges(onStoreChange: () => void) {
  window.addEventListener(STORAGE_EVENT_NAME, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(STORAGE_EVENT_NAME, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function parseBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function parseSettings(rawSettings: string): CyberMapSettings {
  try {
    const parsedSettings = JSON.parse(rawSettings) as Partial<CyberMapSettings>;

    return {
      theme: parsedSettings.theme ?? defaultSettings.theme,
      background: parsedSettings.background ?? defaultSettings.background,
      language: parsedSettings.language ?? defaultSettings.language,
      aiProvider: parsedSettings.aiProvider ?? defaultSettings.aiProvider,
      aiModel: parsedSettings.aiModel ?? defaultSettings.aiModel,
      thinkingMode: parsedSettings.thinkingMode ?? defaultSettings.thinkingMode,
      agentPreset: parsedSettings.agentPreset ?? defaultSettings.agentPreset,
      mcpTransport:
        parsedSettings.mcpTransport ?? defaultSettings.mcpTransport,
      connectorPreset:
        parsedSettings.connectorPreset ?? defaultSettings.connectorPreset,
      requireHumanApproval: parseBoolean(
        parsedSettings.requireHumanApproval,
        defaultSettings.requireHumanApproval
      ),
      sandboxEnabled: parseBoolean(
        parsedSettings.sandboxEnabled,
        defaultSettings.sandboxEnabled
      ),
      auditLogsEnabled: parseBoolean(
        parsedSettings.auditLogsEnabled,
        defaultSettings.auditLogsEnabled
      ),
    };
  } catch {
    return defaultSettings;
  }
}

export function updateSettings(nextSettings: Partial<CyberMapSettings>) {
  const currentSettings = parseSettings(readSettingsRawSnapshot());
  const updatedSettings = {
    ...currentSettings,
    ...nextSettings,
  };

  window.localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(updatedSettings)
  );

  window.dispatchEvent(new Event(STORAGE_EVENT_NAME));
}
