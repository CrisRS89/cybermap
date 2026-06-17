"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getSettingsFieldError,
  parseCyberMapSettings,
  validateCyberMapSettings,
} from "../settings-domain";
import {
  readServerSettingsRawSnapshot,
  readSettingsRawSnapshot,
  subscribeToSettingsChanges,
} from "../settings-storage";
import { AgentHubSettingsSection } from "./sections/agent-hub-settings-section";
import { AiProviderSettingsSection } from "./sections/ai-provider-settings-section";
import { AppearanceSettingsSection } from "./sections/appearance-settings-section";
import { ConnectorsSettingsSection } from "./sections/connectors-settings-section";
import { LanguageSettingsSection } from "./sections/language-settings-section";
import { McpSettingsSection } from "./sections/mcp-settings-section";
import { SecuritySettingsSection } from "./sections/security-settings-section";
import { SettingsSyncStatusBadge } from "./settings-sync-status-badge";
import { ValidationSummary } from "./validation/validation-summary";

export function SettingsForm() {
  const rawSettings = useSyncExternalStore(
    subscribeToSettingsChanges,
    readSettingsRawSnapshot,
    readServerSettingsRawSnapshot
  );

  const settings = useMemo(
    () => parseCyberMapSettings(rawSettings),
    [rawSettings]
  );
  const validationResult = validateCyberMapSettings(settings);

  function getFieldError(field: string) {
    return getSettingsFieldError(validationResult.issues, field);
  }

  return (
    <div className="space-y-6">
      <SettingsSyncStatusBadge />
      <ValidationSummary issues={validationResult.issues} />

      <AppearanceSettingsSection settings={settings} />
      <LanguageSettingsSection settings={settings} />
      <AiProviderSettingsSection
        settings={settings}
        getFieldError={getFieldError}
      />
      <AgentHubSettingsSection
        settings={settings}
        getFieldError={getFieldError}
      />
      <McpSettingsSection settings={settings} />
      <ConnectorsSettingsSection
        settings={settings}
        getFieldError={getFieldError}
      />
      <SecuritySettingsSection settings={settings} />
    </div>
  );
}
