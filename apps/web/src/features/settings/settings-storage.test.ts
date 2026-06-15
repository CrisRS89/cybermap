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

  it("parses valid MCP settings", () => {
    const rawSettings = JSON.stringify({
      ...defaultSettings,
      mcpEnabled: true,
      mcpServerName: "local-tools",
      mcpTransport: "stdio",
      mcpCommand: "python server.py",
      mcpArgs: "--workspace /tmp/cybermap",
      mcpUrl: "http://localhost:8787",
      mcpAllowedTools: "scan.read, findings.write",
      mcpRequiresApproval: true,
    });

    expect(parseSettings(rawSettings)).toEqual({
      ...defaultSettings,
      mcpEnabled: true,
      mcpServerName: "local-tools",
      mcpTransport: "stdio",
      mcpCommand: "python server.py",
      mcpArgs: "--workspace /tmp/cybermap",
      mcpUrl: "http://localhost:8787",
      mcpAllowedTools: "scan.read, findings.write",
      mcpRequiresApproval: true,
    });
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

  it("uses secure Agent Hub defaults", () => {
    expect(defaultSettings.agentRequiresApproval).toBe(true);
    expect(defaultSettings.agentSandboxEnabled).toBe(true);
    expect(defaultSettings.agentNetworkAccess).toBe(false);
    expect(defaultSettings.agentCommand).toBe("");
    expect(defaultSettings.agentWorkingDirectory).toBe("");
    expect(defaultSettings.agentTimeoutSeconds).toBe("120");
  });

  it("uses secure MCP defaults", () => {
    expect(defaultSettings.mcpEnabled).toBe(false);
    expect(defaultSettings.mcpRequiresApproval).toBe(true);
    expect(defaultSettings.mcpServerName).toBe("");
    expect(defaultSettings.mcpCommand).toBe("");
    expect(defaultSettings.mcpArgs).toBe("");
    expect(defaultSettings.mcpUrl).toBe("");
    expect(defaultSettings.mcpAllowedTools).toBe("");
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

  it("updates MCP settings with a partial merge", () => {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        ...defaultSettings,
        mcpEnabled: false,
        mcpServerName: "",
        mcpTransport: "stdio",
      })
    );

    updateSettings({
      mcpEnabled: true,
      mcpServerName: "local-tools",
      mcpCommand: "python server.py",
      mcpArgs: "--workspace /tmp/cybermap",
      mcpAllowedTools: "scan.read, findings.write",
    });

    expect(JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? "{}"))
      .toEqual({
        ...defaultSettings,
        mcpEnabled: true,
        mcpServerName: "local-tools",
        mcpTransport: "stdio",
        mcpCommand: "python server.py",
        mcpArgs: "--workspace /tmp/cybermap",
        mcpAllowedTools: "scan.read, findings.write",
      });
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

  it("does not define or persist a raw API key field in defaults", () => {
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
