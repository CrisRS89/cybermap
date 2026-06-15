import { describe, expect, it } from "vitest";
import { NUMERIC_SETTING_VALIDATION_RULES } from "./settings-schema";

describe("settings schema", () => {
  it("defines the current numeric validation fields", () => {
    expect(NUMERIC_SETTING_VALIDATION_RULES.map((rule) => rule.field)).toEqual([
      "aiTemperature",
      "aiMaxTokens",
      "agentTimeoutSeconds",
      "connectorSyncIntervalMinutes",
    ]);
  });

  it("keeps the current numeric validation ranges", () => {
    expect(NUMERIC_SETTING_VALIDATION_RULES).toEqual([
      {
        field: "aiTemperature",
        kind: "number",
        min: 0,
        max: 2,
      },
      {
        field: "aiMaxTokens",
        kind: "integer",
        min: 1,
        max: 128000,
      },
      {
        field: "agentTimeoutSeconds",
        kind: "integer",
        min: 1,
        max: 3600,
      },
      {
        field: "connectorSyncIntervalMinutes",
        kind: "integer",
        min: 1,
        max: 1440,
      },
    ]);
  });
});
