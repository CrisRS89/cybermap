"use client";

import { useMemo, useSyncExternalStore } from "react";
import { validateSettings } from "../settings-validation";
import type { SettingsValidationIssue } from "../settings-validation";
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

function ValidationSummary({ issues }: { issues: SettingsValidationIssue[] }) {
  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
      <p className="text-sm font-medium text-amber-200">
        Configuración con advertencias
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-5 text-slate-400">
        {issues.map((issue) => (
          <li key={issue.field}>
            <span className="text-slate-300">{issue.field}</span>:{" "}
            {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

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
