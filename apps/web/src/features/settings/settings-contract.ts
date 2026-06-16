import type { CyberMapSettings } from "./settings-types";

/**
 * Payload enviado por el frontend al endpoint PUT /settings.
 *
 * Propósito:
 * - Formalizar el contrato HTTP entre Next.js y FastAPI.
 * - Evitar que settings-api.ts defina tipos propios acoplados a fetch.
 */
export type SettingsApiUpdateRequest = {
  values: CyberMapSettings;
};

/**
 * Payload esperado desde GET /settings y PUT /settings.
 *
 * Nota:
 * - El backend puede devolver valores parciales.
 * - El frontend completa faltantes usando defaultSettings mediante parseSettings.
 */
export type SettingsApiResponse = {
  values: Partial<CyberMapSettings>;
};

/**
 * Estado observable de sincronización frontend-backend.
 *
 * local:
 * - Los settings existen localmente, pero no se intentó sincronizar
 *   o la API no está configurada.
 *
 * syncing:
 * - Hay una sincronización en curso.
 *
 * synced:
 * - La última sincronización terminó correctamente.
 *
 * error:
 * - La última sincronización falló.
 */
export type SettingsSyncStatus = "local" | "syncing" | "synced" | "error";

/**
 * Resultado interno del cliente API.
 *
 * Se mantiene compatible con los tests actuales, pero queda alineado
 * con SettingsSyncStatus para la próxima iteración de UI/storage.
 */
export type SettingsApiSyncResult =
  | {
      synced: true;
      status: "synced";
      values: Partial<CyberMapSettings>;
    }
  | {
      synced: false;
      status: "local" | "error";
    };
