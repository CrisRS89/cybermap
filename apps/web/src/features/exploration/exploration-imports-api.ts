const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type ImportNmapXmlRequest = {
  xml: string;
};

export type ImportNmapXmlSummary = {
  assetsCreated: number;
  hostsSeen: number;
  openPortsSeen: number;
  warnings: string[];
};

export type ImportNmapXmlResponse = {
  summary: ImportNmapXmlSummary;
};

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
    throw new Error(`Exploration imports API request failed: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export async function importNmapXml(
  payload: ImportNmapXmlRequest
): Promise<ImportNmapXmlResponse> {
  return requestJson<ImportNmapXmlResponse>("/exploration/imports/nmap", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
