import type { SettingsValidationIssue } from "../settings-validation";

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
