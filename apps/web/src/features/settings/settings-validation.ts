import { NUMERIC_SETTING_VALIDATION_RULES } from "./settings-schema";
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

  for (const rule of NUMERIC_SETTING_VALIDATION_RULES) {
    const value = settings[rule.field];

    if (rule.kind === "number") {
      validateNumberRange(issues, rule.field, value, rule.min, rule.max);
      continue;
    }

    validateIntegerRange(issues, rule.field, value, rule.min, rule.max);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
