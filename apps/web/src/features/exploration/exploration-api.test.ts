import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createExplorationAsset,
  createExplorationFinding,
  listExplorationAssets,
  listExplorationFindings,
} from "./exploration-api";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("exploration-api", () => {
  it("lists exploration assets", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "asset_1",
            name: "Localhost",
            kind: "host",
            value: "localhost",
            environment: "dev",
            criticality: "medium",
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
          },
        ],
      }),
    } as Response);

    const assets = await listExplorationAssets();

    expect(assets).toHaveLength(1);
    expect(assets[0].name).toBe("Localhost");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/exploration/assets",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("creates an exploration asset", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "asset_1",
        name: "Localhost",
        kind: "host",
        value: "localhost",
        environment: "dev",
        criticality: "medium",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      }),
    } as Response);

    const asset = await createExplorationAsset({
      name: "Localhost",
      kind: "host",
      value: "localhost",
      environment: "dev",
      criticality: "medium",
    });

    expect(asset.id).toBe("asset_1");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/exploration/assets",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Localhost",
          kind: "host",
          value: "localhost",
          environment: "dev",
          criticality: "medium",
        }),
      })
    );
  });

  it("lists exploration findings", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "finding_1",
            title: "Example finding",
            description: "",
            severity: "high",
            status: "open",
            assetId: null,
            source: "manual",
            evidence: "",
            recommendation: "",
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
          },
        ],
      }),
    } as Response);

    const findings = await listExplorationFindings();

    expect(findings).toHaveLength(1);
    expect(findings[0].title).toBe("Example finding");
  });

  it("creates an exploration finding", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "finding_1",
        title: "Example finding",
        description: "",
        severity: "high",
        status: "open",
        assetId: null,
        source: "manual",
        evidence: "evidence",
        recommendation: "",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      }),
    } as Response);

    const finding = await createExplorationFinding({
      title: "Example finding",
      severity: "high",
      evidence: "evidence",
    });

    expect(finding.id).toBe("finding_1");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/exploration/findings",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          title: "Example finding",
          severity: "high",
          evidence: "evidence",
        }),
      })
    );
  });

  it("throws when the API responds with an error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({}),
    } as Response);

    await expect(listExplorationAssets()).rejects.toThrow(
      "Exploration API request failed: 422"
    );
  });
});
