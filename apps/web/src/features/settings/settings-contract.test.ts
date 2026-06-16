import { describe, expect, it } from "vitest";

import type {
  SettingsApiResponse,
  SettingsApiUpdateRequest,
  SettingsSyncStatus,
} from "./settings-contract";
import { defaultSettings } from "./settings-options";

describe("settings API contract", () => {
  it("defines the PUT /settings request shape", () => {
    const requestBody: SettingsApiUpdateRequest = {
      values: defaultSettings,
    };

    expect(requestBody).toEqual({
      values: defaultSettings,
    });
  });

  it("defines the /settings response shape with partial values", () => {
    const responseBody: SettingsApiResponse = {
      values: {
        theme: "Dark Pro",
      },
    };

    expect(responseBody.values).toEqual({
      theme: "Dark Pro",
    });
  });

  it("defines observable sync statuses", () => {
    const statuses: SettingsSyncStatus[] = [
      "local",
      "syncing",
      "synced",
      "error",
    ];

    expect(statuses).toEqual(["local", "syncing", "synced", "error"]);
  });
});
