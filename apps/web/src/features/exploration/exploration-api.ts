import type {
  CreateExplorationAssetRequest,
  CreateExplorationFindingRequest,
  ExplorationAsset,
  ExplorationAssetListResponse,
  ExplorationFinding,
  ExplorationFindingListResponse,
  ExplorationService,
  ExplorationServiceListResponse,
} from "./exploration-types";

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
    throw new Error(`Exploration API request failed: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export async function listExplorationAssets(): Promise<ExplorationAsset[]> {
  const response = await requestJson<ExplorationAssetListResponse>(
    "/exploration/assets"
  );

  return response.items;
}

export async function createExplorationAsset(
  payload: CreateExplorationAssetRequest
): Promise<ExplorationAsset> {
  return requestJson<ExplorationAsset>("/exploration/assets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listExplorationFindings(): Promise<ExplorationFinding[]> {
  const response = await requestJson<ExplorationFindingListResponse>(
    "/exploration/findings"
  );

  return response.items;
}

export async function createExplorationFinding(
  payload: CreateExplorationFindingRequest
): Promise<ExplorationFinding> {
  return requestJson<ExplorationFinding>("/exploration/findings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


export async function listExplorationServices(): Promise<ExplorationService[]> {
  const response = await requestJson<ExplorationServiceListResponse>(
    "/exploration/services"
  );

  return response.items;
}
