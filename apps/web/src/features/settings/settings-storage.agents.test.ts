import { beforeEach, describe, expect, it } from "vitest";
import { defaultSettings } from "./settings-options";
import {
  LOCAL_STORAGE_KEY,
  parseSettings,
  updateSettings,
} from "./settings-storage";

describe("settings-storage Agent Hub", () => {
  beforeEach(() => {
    window.localStorage.clear();
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

  it("uses secure Agent Hub defaults", () => {
    expect(defaultSettings.agentRequiresApproval).toBe(true);
    expect(defaultSettings.agentSandboxEnabled).toBe(true);
    expect(defaultSettings.agentNetworkAccess).toBe(false);
    expect(defaultSettings.agentCommand).toBe("");
    expect(defaultSettings.agentWorkingDirectory).toBe("");
    expect(defaultSettings.agentTimeoutSeconds).toBe("120");
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
});
