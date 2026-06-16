import type { CyberMapSettings } from "./settings-types";

export type SettingsApiResponse = {
  values: Partial<CyberMapSettings>;
};

export type SettingsApiSyncResult =
  | {
      synced: true;
      values: Partial<CyberMapSettings>;
    }
  | {
      synced: false;
    };

export function getSettingsApiBaseUrl(): string | undefined {
  const configuredUrl = process.env.NEXT_PUBLIC_CYBERMAP_API_URL?.trim();

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
    return { synced: false };
  }

  const response = await fetch(`${apiBaseUrl}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: settings,
    }),
  });

  if (!response.ok) {
    return { synced: false };
  }

  const payload = (await response.json()) as SettingsApiResponse;

  return {
    synced: true,
    values: payload.values,
  };
}
