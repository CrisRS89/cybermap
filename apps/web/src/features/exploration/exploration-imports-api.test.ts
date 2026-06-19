import { afterEach, describe, expect, it, vi } from "vitest";

import { importNmapXml } from "./exploration-imports-api";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("exploration-imports-api", () => {
  it("imports Nmap XML", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        summary: {
          assetsCreated: 2,
          hostsSeen: 2,
          openPortsSeen: 3,
          warnings: [],
        },
      }),
    } as Response);

    const response = await importNmapXml({
      xml: "<nmaprun></nmaprun>",
    });

    expect(response.summary.assetsCreated).toBe(2);
    expect(response.summary.hostsSeen).toBe(2);
    expect(response.summary.openPortsSeen).toBe(3);
    expect(response.summary.warnings).toEqual([]);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/exploration/imports/nmap",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          xml: "<nmaprun></nmaprun>",
        }),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("returns parser warnings from the API response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        summary: {
          assetsCreated: 1,
          hostsSeen: 1,
          openPortsSeen: 0,
          warnings: ["Host without address ignored"],
        },
      }),
    } as Response);

    const response = await importNmapXml({
      xml: "<nmaprun></nmaprun>",
    });

    expect(response.summary.warnings).toEqual(["Host without address ignored"]);
  });

  it("throws when the imports API responds with an error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        detail: "Malformed XML",
      }),
    } as Response);

    await expect(
      importNmapXml({
        xml: "<nmaprun>",
      })
    ).rejects.toThrow("Exploration imports API request failed: 400");
  });

  it("throws with 413 when the XML payload is too large", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 413,
      json: async () => ({
        detail: "Nmap XML exceeds maximum size",
      }),
    } as Response);

    await expect(
      importNmapXml({
        xml: "<nmaprun></nmaprun>",
      })
    ).rejects.toThrow("Exploration imports API request failed: 413");
  });
});
