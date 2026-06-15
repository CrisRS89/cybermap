import { beforeEach, describe, expect, it } from "vitest";
import { defaultSettings } from "./settings-options";
import {
  LOCAL_STORAGE_KEY,
  parseSettings,
  updateSettings,
} from "./settings-storage";

describe("settings-storage MCP", () => {
  beforeEach(() => {
    window.localStorage.clear();
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

  it("uses secure MCP defaults", () => {
    expect(defaultSettings.mcpEnabled).toBe(false);
    expect(defaultSettings.mcpRequiresApproval).toBe(true);
    expect(defaultSettings.mcpServerName).toBe("");
    expect(defaultSettings.mcpCommand).toBe("");
    expect(defaultSettings.mcpArgs).toBe("");
    expect(defaultSettings.mcpUrl).toBe("");
    expect(defaultSettings.mcpAllowedTools).toBe("");
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
});
