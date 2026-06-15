import type { CyberMapSettings } from "./settings-types";

export type NumericSettingKind = "number" | "integer";

export type NumericSettingValidationRule = {
  field: keyof CyberMapSettings;
  kind: NumericSettingKind;
  min: number;
  max: number;
};

/**
 * Reglas declarativas para campos numéricos de Settings.
 *
 * Propósito:
 * - documentar constraints en un lugar único
 * - preparar validación schema-driven
 * - evitar duplicación de min/max en UI, tests o backend futuro
 */
export const NUMERIC_SETTING_VALIDATION_RULES = [
  {
    field: "aiTemperature",
    kind: "number",
    min: 0,
    max: 2,
  },
  {
    field: "aiMaxTokens",
    kind: "integer",
    min: 1,
    max: 128000,
  },
  {
    field: "agentTimeoutSeconds",
    kind: "integer",
    min: 1,
    max: 3600,
  },
  {
    field: "connectorSyncIntervalMinutes",
    kind: "integer",
    min: 1,
    max: 1440,
  },
] satisfies NumericSettingValidationRule[];
