import { beforeEach, describe, expect, it } from "vitest";
import { defaultSettings } from "./settings-options";
import {
  LOCAL_STORAGE_KEY,
  parseSettings,
  updateSettings,
} from "./settings-storage";

describe("settings-storage AI Provider", () => {
  beforeEach(() => {
    window.localStorage.clear();
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
});
