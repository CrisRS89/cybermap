import type { CyberMapSettings } from "./settings-types";
import type {
  SettingsValidationIssue,
  SettingsValidationResult,
} from "./settings-validation.types";

function isFiniteNumber(value: string): boolean {
  return Number.isFinite(Number(value));
}

function isIntegerString(value: string): boolean {
  if (!isFiniteNumber(value)) {
    return false;
  }

  return Number.isInteger(Number(value));
}

function validateNumberRange(
  issues: SettingsValidationIssue[],
  field: keyof CyberMapSettings,
  value: string,
  min: number,
  max: number
) {
  const numericValue = Number(value);

  if (!isFiniteNumber(value) || numericValue < min || numericValue > max) {
    issues.push({
      field,
      message: `Debe ser un número entre ${min} y ${max}.`,
    });
  }
}

function validateIntegerRange(
  issues: SettingsValidationIssue[],
  field: keyof CyberMapSettings,
  value: string,
  min: number,
  max: number
) {
  const numericValue = Number(value);

  if (!isIntegerString(value) || numericValue < min || numericValue > max) {
    issues.push({
      field,
      message: `Debe ser un entero entre ${min} y ${max}.`,
    });
  }
}

export function validateSettings(
  settings: CyberMapSettings
): SettingsValidationResult {
  const issues: SettingsValidationIssue[] = [];

  validateNumberRange(issues, "aiTemperature", settings.aiTemperature, 0, 2);
  validateIntegerRange(issues, "aiMaxTokens", settings.aiMaxTokens, 1, 128000);
  validateIntegerRange(
    issues,
    "agentTimeoutSeconds",
    settings.agentTimeoutSeconds,
    1,
    3600
  );
  validateIntegerRange(
    issues,
    "connectorSyncIntervalMinutes",
    settings.connectorSyncIntervalMinutes,
    1,
    1440
  );

  return {
    valid: issues.length === 0,
    issues,
  };
}
