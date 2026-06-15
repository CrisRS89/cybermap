import { beforeEach, describe, expect, it } from "vitest";
import { defaultSettings } from "./settings-options";
import {
  LOCAL_STORAGE_KEY,
  parseSettings,
  updateSettings,
} from "./settings-storage";

describe("settings-storage Connectors", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("parses valid Connectors settings", () => {
    const rawSettings = JSON.stringify({
      ...defaultSettings,
      connectorEnabled: true,
      connectorPreset: "Wazuh",
      connectorBaseUrl: "https://wazuh.local",
      connectorAuthMode: "bearer_token",
      connectorSecretConfigured: true,
      connectorSyncIntervalMinutes: "15",
      connectorIngestFindings: true,
      connectorIngestAssets: false,
      connectorRequiresApproval: true,
    });

    expect(parseSettings(rawSettings)).toEqual({
      ...defaultSettings,
      connectorEnabled: true,
      connectorPreset: "Wazuh",
      connectorBaseUrl: "https://wazuh.local",
      connectorAuthMode: "bearer_token",
      connectorSecretConfigured: true,
      connectorSyncIntervalMinutes: "15",
      connectorIngestFindings: true,
      connectorIngestAssets: false,
      connectorRequiresApproval: true,
    });
  });

  it("uses secure Connectors defaults", () => {
    expect(defaultSettings.connectorEnabled).toBe(false);
    expect(defaultSettings.connectorSecretConfigured).toBe(false);
    expect(defaultSettings.connectorRequiresApproval).toBe(true);
    expect(defaultSettings.connectorBaseUrl).toBe("");
    expect(defaultSettings.connectorSyncIntervalMinutes).toBe("60");
    expect(defaultSettings.connectorIngestFindings).toBe(true);
    expect(defaultSettings.connectorIngestAssets).toBe(true);
  });

  it("updates Connectors settings with a partial merge", () => {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        ...defaultSettings,
        connectorEnabled: false,
        connectorPreset: "Nmap",
        connectorSecretConfigured: false,
      })
    );

    updateSettings({
      connectorEnabled: true,
      connectorPreset: "TheHive",
      connectorBaseUrl: "https://thehive.local",
      connectorAuthMode: "api_key",
      connectorSyncIntervalMinutes: "30",
      connectorSecretConfigured: true,
    });

    expect(JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? "{}"))
      .toEqual({
        ...defaultSettings,
        connectorEnabled: true,
        connectorPreset: "TheHive",
        connectorBaseUrl: "https://thehive.local",
        connectorAuthMode: "api_key",
        connectorSyncIntervalMinutes: "30",
        connectorSecretConfigured: true,
      });
  });
});
