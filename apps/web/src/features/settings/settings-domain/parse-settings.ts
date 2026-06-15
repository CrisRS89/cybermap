import { parseSettings } from "../settings-storage";
import type { CyberMapSettings } from "../settings-types";

/**
 * Convierte el snapshot serializado de settings en el modelo usable por la UI.
 *
 * Propósito:
 * - ocultar a los componentes que el storage trabaja con un snapshot string
 * - mantener SettingsForm como orquestador, no como parser
 */
export function parseCyberMapSettings(rawSettings: string): CyberMapSettings {
  return parseSettings(rawSettings);
}
