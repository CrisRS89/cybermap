import type {
  SettingsApiResponse,
  SettingsApiSyncResult,
  SettingsApiUpdateRequest,
} from "./settings-contract";
import type { CyberMapSettings } from "./settings-types";

export function getSettingsApiBaseUrl(): string | undefined {
  const configuredUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_CYBERMAP_API_URL
  )?.trim();

  if (!configuredUrl) {
    return undefined;
  }

  return configuredUrl.replace(/\/$/, "");
}

export async function saveSettingsToApi(
  settings: CyberMapSettings
): Promise<SettingsApiSyncResult> {
  const apiBaseUrl = getSettingsApiBaseUrl();

  if (!apiBaseUrl || typeof fetch === "undefined") {
    return {
      synced: false,
      status: "local",
    };
  }

  const requestBody: SettingsApiUpdateRequest = {
    values: settings,
  };

  const response = await fetch(`${apiBaseUrl}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    return {
      synced: false,
      status: "error",
    };
  }

  const payload = (await response.json()) as SettingsApiResponse;

  return {
    synced: true,
    status: "synced",
    values: payload.values,
  };
}
