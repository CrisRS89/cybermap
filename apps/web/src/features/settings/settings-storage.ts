import { saveSettingsToApi } from "./settings-api";
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
      aiBaseUrl: parsedSettings.aiBaseUrl ?? defaultSettings.aiBaseUrl,
      thinkingMode: parsedSettings.thinkingMode ?? defaultSettings.thinkingMode,
      aiTemperature:
        parsedSettings.aiTemperature ?? defaultSettings.aiTemperature,
      aiMaxTokens: parsedSettings.aiMaxTokens ?? defaultSettings.aiMaxTokens,
      aiPrivacyMode:
        parsedSettings.aiPrivacyMode ?? defaultSettings.aiPrivacyMode,
      aiApiKeyConfigured: parseBoolean(
        parsedSettings.aiApiKeyConfigured,
        defaultSettings.aiApiKeyConfigured
      ),
      agentPreset: parsedSettings.agentPreset ?? defaultSettings.agentPreset,
      agentIntegrationType:
        parsedSettings.agentIntegrationType ??
        defaultSettings.agentIntegrationType,
      agentCommand: parsedSettings.agentCommand ?? defaultSettings.agentCommand,
      agentWorkingDirectory:
        parsedSettings.agentWorkingDirectory ??
        defaultSettings.agentWorkingDirectory,
      agentTimeoutSeconds:
        parsedSettings.agentTimeoutSeconds ??
        defaultSettings.agentTimeoutSeconds,
      agentRequiresApproval: parseBoolean(
        parsedSettings.agentRequiresApproval,
        defaultSettings.agentRequiresApproval
      ),
      agentSandboxEnabled: parseBoolean(
        parsedSettings.agentSandboxEnabled,
        defaultSettings.agentSandboxEnabled
      ),
      agentNetworkAccess: parseBoolean(
        parsedSettings.agentNetworkAccess,
        defaultSettings.agentNetworkAccess
      ),
      mcpEnabled: parseBoolean(
        parsedSettings.mcpEnabled,
        defaultSettings.mcpEnabled
      ),
      mcpServerName:
        parsedSettings.mcpServerName ?? defaultSettings.mcpServerName,
      mcpTransport:
        parsedSettings.mcpTransport ?? defaultSettings.mcpTransport,
      mcpCommand: parsedSettings.mcpCommand ?? defaultSettings.mcpCommand,
      mcpArgs: parsedSettings.mcpArgs ?? defaultSettings.mcpArgs,
      mcpUrl: parsedSettings.mcpUrl ?? defaultSettings.mcpUrl,
      mcpAllowedTools:
        parsedSettings.mcpAllowedTools ?? defaultSettings.mcpAllowedTools,
      mcpRequiresApproval: parseBoolean(
        parsedSettings.mcpRequiresApproval,
        defaultSettings.mcpRequiresApproval
      ),
      connectorEnabled: parseBoolean(
        parsedSettings.connectorEnabled,
        defaultSettings.connectorEnabled
      ),
      connectorPreset:
        parsedSettings.connectorPreset ?? defaultSettings.connectorPreset,
      connectorBaseUrl:
        parsedSettings.connectorBaseUrl ?? defaultSettings.connectorBaseUrl,
      connectorAuthMode:
        parsedSettings.connectorAuthMode ?? defaultSettings.connectorAuthMode,
      connectorSecretConfigured: parseBoolean(
        parsedSettings.connectorSecretConfigured,
        defaultSettings.connectorSecretConfigured
      ),
      connectorSyncIntervalMinutes:
        parsedSettings.connectorSyncIntervalMinutes ??
        defaultSettings.connectorSyncIntervalMinutes,
      connectorIngestFindings: parseBoolean(
        parsedSettings.connectorIngestFindings,
        defaultSettings.connectorIngestFindings
      ),
      connectorIngestAssets: parseBoolean(
        parsedSettings.connectorIngestAssets,
        defaultSettings.connectorIngestAssets
      ),
      connectorRequiresApproval: parseBoolean(
        parsedSettings.connectorRequiresApproval,
        defaultSettings.connectorRequiresApproval
      ),
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

  void saveSettingsToApi(updatedSettings).catch(() => undefined);
}
