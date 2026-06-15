import { describe, expect, it } from "vitest";
import { defaultSettings } from "./settings-options";
import {
  getSettingsFieldError,
  parseCyberMapSettings,
  validateCyberMapSettings,
} from "./settings-domain";

describe("settings domain facade", () => {
  it("parses a valid raw settings snapshot", () => {
    const rawSettings = JSON.stringify({
      ...defaultSettings,
      aiModel: "custom-model",
    });

    const settings = parseCyberMapSettings(rawSettings);

    expect(settings.aiModel).toBe("custom-model");
  });

  it("falls back to default settings when raw settings are invalid JSON", () => {
    const settings = parseCyberMapSettings("{invalid-json");

    expect(settings).toEqual(defaultSettings);
  });

  it("validates semantic settings constraints", () => {
    const validationResult = validateCyberMapSettings({
      ...defaultSettings,
      aiTemperature: "9",
      aiMaxTokens: "0",
      agentTimeoutSeconds: "0",
      connectorSyncIntervalMinutes: "0",
    });

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "aiTemperature" }),
        expect.objectContaining({ field: "aiMaxTokens" }),
        expect.objectContaining({ field: "agentTimeoutSeconds" }),
        expect.objectContaining({ field: "connectorSyncIntervalMinutes" }),
      ])
    );
  });

  it("returns a field error message when the field has an issue", () => {
    const issues = [
      {
        field: "aiTemperature",
        message: "Temperature must be between 0 and 2.",
      },
    ];

    const message = getSettingsFieldError(issues, "aiTemperature");

    expect(message).toBe("Temperature must be between 0 and 2.");
  });

  it("returns undefined when the field does not have an issue", () => {
    const issues = [
      {
        field: "aiTemperature",
        message: "Temperature must be between 0 and 2.",
      },
    ];

    const message = getSettingsFieldError(issues, "aiMaxTokens");

    expect(message).toBeUndefined();
  });
});
