import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultSettings } from "./settings-options";
import {
  LOCAL_STORAGE_KEY,
  STORAGE_EVENT_NAME,
  parseSettings,
  readSettingsRawSnapshot,
  updateSettings,
} from "./settings-storage";

describe("settings-storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns default raw settings when localStorage is empty", () => {
    expect(readSettingsRawSnapshot()).toBe(JSON.stringify(defaultSettings));
  });

  it("parses valid settings", () => {
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

  it("parses valid AI provider settings", () => {
    const rawSettings = JSON.stringify({
      ...defaultSettings,
      aiProvider: "OpenRouter",
      aiModel: "anthropic/claude-sonnet-4",
      aiBaseUrl: "https://openrouter.ai/api/v1",
      thinkingMode: "Profundo",
      aiTemperature: "0.1",
      aiMaxTokens: "4096",
      aiPrivacyMode: "Redacted context",
      aiApiKeyConfigured: true,
    });

    expect(parseSettings(rawSettings)).toEqual({
      ...defaultSettings,
      aiProvider: "OpenRouter",
      aiModel: "anthropic/claude-sonnet-4",
      aiBaseUrl: "https://openrouter.ai/api/v1",
      thinkingMode: "Profundo",
      aiTemperature: "0.1",
      aiMaxTokens: "4096",
      aiPrivacyMode: "Redacted context",
      aiApiKeyConfigured: true,
    });
  });

  it("parses valid Agent Hub settings", () => {
    const rawSettings = JSON.stringify({
      ...defaultSettings,
      agentPreset: "OpenCode",
      agentIntegrationType: "cli",
      agentCommand: "opencode run",
      agentWorkingDirectory: "/workspace/cybermap",
      agentTimeoutSeconds: "240",
      agentRequiresApproval: true,
      agentSandboxEnabled: true,
      agentNetworkAccess: false,
    });

    expect(parseSettings(rawSettings)).toEqual({
      ...defaultSettings,
      agentPreset: "OpenCode",
      agentIntegrationType: "cli",
      agentCommand: "opencode run",
      agentWorkingDirectory: "/workspace/cybermap",
      agentTimeoutSeconds: "240",
      agentRequiresApproval: true,
      agentSandboxEnabled: true,
      agentNetworkAccess: false,
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
    });

    expect(parseSettings(rawSettings)).toEqual(defaultSettings);
  });

  it("uses secure Agent Hub defaults", () => {
    expect(defaultSettings.agentRequiresApproval).toBe(true);
    expect(defaultSettings.agentSandboxEnabled).toBe(true);
    expect(defaultSettings.agentNetworkAccess).toBe(false);
    expect(defaultSettings.agentCommand).toBe("");
    expect(defaultSettings.agentWorkingDirectory).toBe("");
    expect(defaultSettings.agentTimeoutSeconds).toBe("120");
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

  it("updates AI provider settings with a partial merge", () => {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        ...defaultSettings,
        aiProvider: "OpenAI",
        aiModel: "gpt-4.1-mini",
        aiBaseUrl: "",
      })
    );

    updateSettings({
      aiProvider: "Ollama",
      aiModel: "llama3.2",
      aiBaseUrl: "http://localhost:11434/v1",
      aiPrivacyMode: "Local only",
    });

    expect(JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? "{}"))
      .toEqual({
        ...defaultSettings,
        aiProvider: "Ollama",
        aiModel: "llama3.2",
        aiBaseUrl: "http://localhost:11434/v1",
        aiPrivacyMode: "Local only",
      });
  });

  it("updates Agent Hub settings with a partial merge", () => {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        ...defaultSettings,
        agentPreset: "Aider",
        agentIntegrationType: "cli",
        agentNetworkAccess: false,
      })
    );

    updateSettings({
      agentPreset: "Custom CLI",
      agentCommand: "custom-agent run",
      agentWorkingDirectory: "/workspace/project",
      agentTimeoutSeconds: "300",
      agentNetworkAccess: true,
    });

    expect(JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? "{}"))
      .toEqual({
        ...defaultSettings,
        agentPreset: "Custom CLI",
        agentIntegrationType: "cli",
        agentCommand: "custom-agent run",
        agentWorkingDirectory: "/workspace/project",
        agentTimeoutSeconds: "300",
        agentNetworkAccess: true,
      });
  });

  it("does not define or persist a raw API key field in defaults", () => {
    expect(defaultSettings).not.toHaveProperty("apiKey");
    expect(defaultSettings).not.toHaveProperty("aiApiKey");
    expect(defaultSettings).not.toHaveProperty("aiApiKeyValue");
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
