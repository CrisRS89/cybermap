"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
} from "../settings-options";
import {
  parseSettings,
  readServerSettingsRawSnapshot,
  readSettingsRawSnapshot,
  subscribeToSettingsChanges,
  updateSettings,
} from "../settings-storage";
import { validateSettings } from "../settings-validation";
import { AgentHubSettingsSection } from "./agent-hub-settings-section";
import { AiProviderSettingsSection } from "./ai-provider-settings-section";
import { AppearanceSettingsSection } from "./appearance-settings-section";
import { ConnectorsSettingsSection } from "./connectors-settings-section";
import { LanguageSettingsSection } from "./language-settings-section";
import { McpSettingsSection } from "./mcp-settings-section";
import { SelectField } from "./select-field";
import { SettingsSection } from "./settings-section";
import { TextField } from "./text-field";
import { ToggleField } from "./toggle-field";

type ValidationIssueView = {
  field: string;
  message: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-xs text-amber-200">{message}</p>;
}

function ValidationSummary({ issues }: { issues: ValidationIssueView[] }) {
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

      <SettingsSection
        id="security"
        eyebrow="Security"
        title="Políticas de seguridad"
        description="Controles mínimos para impedir ejecución peligrosa sin autorización."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <ToggleField
            label="Aprobación humana"
            description="Requerida antes de ejecutar acciones sensibles."
            checked={settings.requireHumanApproval}
            onChange={(requireHumanApproval) =>
              updateSettings({ requireHumanApproval })
            }
          />
          <ToggleField
            label="Sandbox"
            description="Ejecutar agentes y scanners en entorno aislado."
            checked={settings.sandboxEnabled}
            onChange={(sandboxEnabled) => updateSettings({ sandboxEnabled })}
          />
          <ToggleField
            label="Audit logs"
            description="Registrar acciones relevantes para trazabilidad."
            checked={settings.auditLogsEnabled}
            onChange={(auditLogsEnabled) =>
              updateSettings({ auditLogsEnabled })
            }
          />
        </div>
      </SettingsSection>

      <section className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
        <p className="text-sm font-medium text-amber-200">
          Persistencia temporal
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          La configuración actual se guarda en localStorage. No usar para
          secretos reales, tokens ni credenciales.
        </p>
      </section>
    </div>
  );
}
