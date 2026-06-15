import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultSettings } from "./settings-options";
import {
  LOCAL_STORAGE_KEY,
  STORAGE_EVENT_NAME,
  parseSettings,
  readSettingsRawSnapshot,
  updateSettings,
} from "./settings-storage";

describe("settings-storage base", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns default raw settings when localStorage is empty", () => {
    expect(readSettingsRawSnapshot()).toBe(JSON.stringify(defaultSettings));
  });

  it("parses valid base settings", () => {
    const rawSettings = JSON.stringify({
      ...defaultSettings,
      theme: "Dracula",
      background: "Puntos",
      language: "EN",
    });

    expect(parseSettings(rawSettings)).toEqual({
      ...defaultSettings,
      theme: "Dracula",
      background: "Puntos",
      language: "EN",
    });
  });

  it("returns defaults when JSON is corrupt", () => {
    expect(parseSettings("{invalid-json")).toEqual(defaultSettings);
  });

  it("fills missing fields with defaults", () => {
    const rawSettings = JSON.stringify({
      theme: "Hacking Green",
    });

    expect(parseSettings(rawSettings)).toEqual({
      ...defaultSettings,
      theme: "Hacking Green",
    });
  });

  it("falls back to default booleans when boolean fields are invalid", () => {
    const rawSettings = JSON.stringify({
      requireHumanApproval: "yes",
      sandboxEnabled: null,
      auditLogsEnabled: 1,
      aiApiKeyConfigured: "true",
      agentRequiresApproval: "yes",
      agentSandboxEnabled: "true",
      agentNetworkAccess: "false",
      mcpEnabled: "true",
      mcpRequiresApproval: "yes",
      connectorEnabled: "true",
      connectorSecretConfigured: "yes",
      connectorIngestFindings: "true",
      connectorIngestAssets: "false",
      connectorRequiresApproval: "yes",
    });

    expect(parseSettings(rawSettings)).toEqual(defaultSettings);
  });

  it("updates settings with a partial merge", () => {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        ...defaultSettings,
        theme: "Dark Pro",
        language: "ES",
      })
    );

    updateSettings({
      theme: "Claude Warm",
    });

    expect(JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? "{}"))
      .toEqual({
        ...defaultSettings,
        theme: "Claude Warm",
        language: "ES",
      });
  });

  it("does not define or persist raw secret fields in defaults", () => {
    expect(defaultSettings).not.toHaveProperty("apiKey");
    expect(defaultSettings).not.toHaveProperty("aiApiKey");
    expect(defaultSettings).not.toHaveProperty("aiApiKeyValue");
    expect(defaultSettings).not.toHaveProperty("connectorSecret");
    expect(defaultSettings).not.toHaveProperty("connectorApiKey");
    expect(defaultSettings).not.toHaveProperty("connectorToken");
  });

  it("dispatches a settings change event after update", () => {
    const listener = vi.fn();
    window.addEventListener(STORAGE_EVENT_NAME, listener);

    updateSettings({
      language: "EN",
    });

    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(STORAGE_EVENT_NAME, listener);
  });
});
