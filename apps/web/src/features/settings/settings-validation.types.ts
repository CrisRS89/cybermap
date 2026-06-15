import type { CyberMapSettings } from "./settings-types";

export type SettingsValidationIssue = {
  field: keyof CyberMapSettings;
  message: string;
};

export type SettingsValidationResult = {
  valid: boolean;
  issues: SettingsValidationIssue[];
};
