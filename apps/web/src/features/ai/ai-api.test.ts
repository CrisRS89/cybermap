import { afterEach, describe, expect, it, vi } from "vitest";

import { runAiAgent } from "./ai-api";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("ai-api", () => {
  it("runs an AI agent", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        agentId: "exploration_analyst",
        providerId: "mock",
        model: "mock-security-model",
        status: "completed",
        summary: "Análisis mock generado por CyberMap.",
        recommendations: [
          {
            title: "Revisar exposición de servicios HTTP/HTTPS",
            severity: "medium",
            rationale: "Se detectaron servicios web expuestos.",
            suggestedFinding: true,
          },
        ],
        evidenceUsed: {
          assets: 4,
          services: 3,
          findings: 0,
        },
      }),
    } as Response);

    const response = await runAiAgent({
      agentId: "exploration_analyst",
      providerId: "mock",
      model: "mock-security-model",
      task: "Analizar superficie detectada",
      scope: {
        assetIds: [],
        includeAssets: true,
        includeServices: true,
        includeFindings: true,
      },
    });

    expect(response.agentId).toBe("exploration_analyst");
    expect(response.providerId).toBe("mock");
    expect(response.status).toBe("completed");
    expect(response.evidenceUsed).toEqual({
      assets: 4,
      services: 3,
      findings: 0,
    });
    expect(response.recommendations).toHaveLength(1);
    expect(response.recommendations[0].suggestedFinding).toBe(true);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/ai/runs",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          agentId: "exploration_analyst",
          providerId: "mock",
          model: "mock-security-model",
          task: "Analizar superficie detectada",
          scope: {
            assetIds: [],
            includeAssets: true,
            includeServices: true,
            includeFindings: true,
          },
        }),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("runs an AI agent without explicit scope", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        agentId: "exploration_analyst",
        providerId: "mock",
        model: "mock-security-model",
        status: "completed",
        summary: "Análisis mock generado por CyberMap.",
        recommendations: [],
        evidenceUsed: {
          assets: 0,
          services: 0,
          findings: 0,
        },
      }),
    } as Response);

    const response = await runAiAgent({
      agentId: "exploration_analyst",
      providerId: "mock",
      model: "mock-security-model",
      task: "Analizar superficie detectada",
    });

    expect(response.status).toBe("completed");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/ai/runs",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          agentId: "exploration_analyst",
          providerId: "mock",
          model: "mock-security-model",
          task: "Analizar superficie detectada",
        }),
      })
    );
  });

  it("throws when the AI API responds with an error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        detail: "Unknown provider: missing_provider",
      }),
    } as Response);

    await expect(
      runAiAgent({
        agentId: "exploration_analyst",
        providerId: "missing_provider",
        model: "mock-security-model",
        task: "Analizar superficie detectada",
      })
    ).rejects.toThrow("AI API request failed: 400");
  });
});
