import type { CyberMapSettings } from "../settings-types";
import {
  validateSettings,
  type SettingsValidationResult,
} from "../settings-validation";

/**
 * Valida el modelo de settings contra reglas semánticas del dominio.
 *
 * Propósito:
 * - centralizar la entrada a validación
 * - preparar futura separación entre UI model, DTO remoto y dominio
 */
export function validateCyberMapSettings(
  settings: CyberMapSettings
): SettingsValidationResult {
  return validateSettings(settings);
}
