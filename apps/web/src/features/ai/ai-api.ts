import type {
  AgentRunRequest,
  AgentRunResponse,
  AiRunHistoryItem,
  AiRunListResponse,
} from "./ai-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function requestJson<TResponse>(
  path: string,
  init?: RequestInit
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`AI API request failed: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export async function runAiAgent(
  payload: AgentRunRequest
): Promise<AgentRunResponse> {
  return requestJson<AgentRunResponse>("/ai/runs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listAiRuns(): Promise<AiRunHistoryItem[]> {
  const response = await requestJson<AiRunListResponse>("/ai/runs");

  return response.items;
}
