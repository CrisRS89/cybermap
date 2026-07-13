import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getSettingsApiBaseUrl,
  saveSettingsToApi,
} from "./settings-api";
import { defaultSettings } from "./settings-options";

describe("settings API client", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_CYBERMAP_API_URL;
    vi.unstubAllGlobals();
  });

  it("returns undefined when API URL is not configured", () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_CYBERMAP_API_URL;

    expect(getSettingsApiBaseUrl()).toBeUndefined();
  });

  it("normalizes trailing slash from API URL", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000/";

    expect(getSettingsApiBaseUrl()).toBe("http://localhost:8000");
  });

  it("supports the legacy settings API URL environment variable", () => {
    process.env.NEXT_PUBLIC_CYBERMAP_API_URL = "http://localhost:8001/";

    expect(getSettingsApiBaseUrl()).toBe("http://localhost:8001");
  });

  it("sends settings to the configured API", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        values: {
          theme: "Dark Pro",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await saveSettingsToApi({
      ...defaultSettings,
      theme: "Dark Pro",
    });

    expect(result).toEqual({
      synced: true,
      status: "synced",
      values: {
        theme: "Dark Pro",
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/settings",
      expect.objectContaining({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);

    expect(requestBody.values.theme).toBe("Dark Pro");
  });

  it("returns not synced when API response fails", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      })
    );

    await expect(saveSettingsToApi(defaultSettings)).resolves.toEqual({
      synced: false,
      status: "error",
    });
  });
});
