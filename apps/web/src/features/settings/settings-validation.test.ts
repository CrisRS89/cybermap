import { describe, expect, it } from "vitest";
import { defaultSettings } from "./settings-options";
import { validateSettings } from "./settings-validation";

describe("settings-validation", () => {
  it("accepts default settings", () => {
    expect(validateSettings(defaultSettings)).toEqual({
      valid: true,
      issues: [],
    });
  });

  it("rejects invalid AI temperature values", () => {
    expect(
      validateSettings({
        ...defaultSettings,
        aiTemperature: "abc",
      })
    ).toEqual({
      valid: false,
      issues: [
        {
          field: "aiTemperature",
          message: "Debe ser un número entre 0 y 2.",
        },
      ],
    });

    expect(
      validateSettings({
        ...defaultSettings,
        aiTemperature: "3",
      }).valid
    ).toBe(false);
  });

  it("rejects invalid AI max tokens values", () => {
    expect(
      validateSettings({
        ...defaultSettings,
        aiMaxTokens: "0",
      }).valid
    ).toBe(false);

    expect(
      validateSettings({
        ...defaultSettings,
        aiMaxTokens: "128001",
      }).valid
    ).toBe(false);

    expect(
      validateSettings({
        ...defaultSettings,
        aiMaxTokens: "1024.5",
      }).valid
    ).toBe(false);
  });

  it("rejects invalid agent timeout values", () => {
    expect(
      validateSettings({
        ...defaultSettings,
        agentTimeoutSeconds: "0",
      }).valid
    ).toBe(false);

    expect(
      validateSettings({
        ...defaultSettings,
        agentTimeoutSeconds: "3601",
      }).valid
    ).toBe(false);
  });

  it("rejects invalid connector sync interval values", () => {
    expect(
      validateSettings({
        ...defaultSettings,
        connectorSyncIntervalMinutes: "0",
      }).valid
    ).toBe(false);

    expect(
      validateSettings({
        ...defaultSettings,
        connectorSyncIntervalMinutes: "1441",
      }).valid
    ).toBe(false);
  });

  it("collects multiple validation issues", () => {
    const result = validateSettings({
      ...defaultSettings,
      aiTemperature: "-1",
      aiMaxTokens: "abc",
      agentTimeoutSeconds: "0",
      connectorSyncIntervalMinutes: "NaN",
    });

    expect(result.valid).toBe(false);
    expect(result.issues).toHaveLength(4);
    expect(result.issues.map((issue) => issue.field)).toEqual([
      "aiTemperature",
      "aiMaxTokens",
      "agentTimeoutSeconds",
      "connectorSyncIntervalMinutes",
    ]);
  });
});

import { NUMERIC_SETTING_VALIDATION_RULES } from "./settings-schema";

describe("settings validation schema integration", () => {
  it("validates every numeric schema rule", () => {
    for (const rule of NUMERIC_SETTING_VALIDATION_RULES) {
      const validationResult = validateSettings({
        ...defaultSettings,
        [rule.field]: String(rule.min - 1),
      });

      expect(validationResult.valid).toBe(false);
      expect(validationResult.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: rule.field,
          }),
        ])
      );
    }
  });
});
