"use client";

import { useMemo, useSyncExternalStore } from "react";
import { validateSettings } from "../settings-validation";
import {
  parseSettings,
  readServerSettingsRawSnapshot,
  readSettingsRawSnapshot,
  subscribeToSettingsChanges,
} from "../settings-storage";
import { AgentHubSettingsSection } from "./agent-hub-settings-section";
import { AiProviderSettingsSection } from "./ai-provider-settings-section";
import { AppearanceSettingsSection } from "./appearance-settings-section";
import { ConnectorsSettingsSection } from "./connectors-settings-section";
import { LanguageSettingsSection } from "./language-settings-section";
import { McpSettingsSection } from "./mcp-settings-section";
import { SecuritySettingsSection } from "./security-settings-section";
import { ValidationSummary } from "./validation-summary";

export function SettingsForm() {
  const rawSettings = useSyncExternalStore(
    subscribeToSettingsChanges,
    readSettingsRawSnapshot,
    readServerSettingsRawSnapshot
  );

  const settings = useMemo(() => parseSettings(rawSettings), [rawSettings]);
  const validationResult = validateSettings(settings);

  function getFieldError(field: string) {
    return validationResult.issues.find((issue) => issue.field === field)
      ?.message;
  }

  return (
    <div className="space-y-6">
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
