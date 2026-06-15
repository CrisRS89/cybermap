import { parseSettings } from "./settings-storage";
import type { CyberMapSettings } from "./settings-types";
import {
  validateSettings,
  type SettingsValidationIssue,
  type SettingsValidationResult,
} from "./settings-validation";

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

/**
 * Obtiene el mensaje de error asociado a un campo.
 *
 * Propósito:
 * - evitar repetir búsquedas `.find(...)` en componentes
 * - estandarizar cómo la UI consulta errores por campo
 */
export function getSettingsFieldError(
  issues: SettingsValidationIssue[],
  field: string
): string | undefined {
  return issues.find((issue) => issue.field === field)?.message;
}
