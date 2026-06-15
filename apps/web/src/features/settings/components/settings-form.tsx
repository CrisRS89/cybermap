"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  CONNECTOR_AUTH_MODES,
  CONNECTOR_PRESETS,
  MCP_TRANSPORTS,
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
import { LanguageSettingsSection } from "./language-settings-section";
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

      <SettingsSection
        id="mcp"
        eyebrow="MCP"
        title="MCP Servers"
        description="Configuración visual inicial para servidores MCP. No se inicia ningún proceso ni conexión desde frontend."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <TextField
            label="Nombre del servidor"
            value={settings.mcpServerName}
            placeholder="local-tools"
            onChange={(mcpServerName) => updateSettings({ mcpServerName })}
          />
          <SelectField
            label="Transporte"
            value={settings.mcpTransport}
            options={MCP_TRANSPORTS}
            onChange={(mcpTransport) => updateSettings({ mcpTransport })}
          />
          <TextField
            label="URL HTTP"
            value={settings.mcpUrl}
            placeholder="http://localhost:8787"
            onChange={(mcpUrl) => updateSettings({ mcpUrl })}
          />
          <TextField
            label="Comando stdio"
            value={settings.mcpCommand}
            placeholder="python server.py"
            onChange={(mcpCommand) => updateSettings({ mcpCommand })}
          />
          <TextField
            label="Argumentos"
            value={settings.mcpArgs}
            placeholder="--workspace /tmp/cybermap"
            onChange={(mcpArgs) => updateSettings({ mcpArgs })}
          />
          <TextField
            label="Allowed tools"
            value={settings.mcpAllowedTools}
            placeholder="scan.read, findings.write"
            onChange={(mcpAllowedTools) =>
              updateSettings({ mcpAllowedTools })
            }
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ToggleField
            label="MCP habilitado"
            description="Desactivado por defecto hasta configurar permisos."
            checked={settings.mcpEnabled}
            onChange={(mcpEnabled) => updateSettings({ mcpEnabled })}
          />
          <ToggleField
            label="Aprobación MCP"
            description="Requerir aprobación humana para herramientas sensibles."
            checked={settings.mcpRequiresApproval}
            onChange={(mcpRequiresApproval) =>
              updateSettings({ mcpRequiresApproval })
            }
          />
        </div>

        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
          <p className="text-sm font-medium text-amber-200">
            MCP seguro por defecto
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Esta pantalla solo almacena configuración local. La conexión real
            deberá pasar por backend, allowlist de herramientas, control de
            permisos y auditoría.
          </p>
        </div>
      </SettingsSection>

      <SettingsSection
        id="connectors"
        eyebrow="Connectors"
        title="Conectores"
        description="Configura fuentes externas de datos. No se guardan secretos reales ni se ejecutan sincronizaciones desde frontend."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <SelectField
            label="Connector preset"
            value={settings.connectorPreset}
            options={CONNECTOR_PRESETS}
            onChange={(connectorPreset) =>
              updateSettings({ connectorPreset })
            }
          />
          <SelectField
            label="Auth mode"
            value={settings.connectorAuthMode}
            options={CONNECTOR_AUTH_MODES}
            onChange={(connectorAuthMode) =>
              updateSettings({ connectorAuthMode })
            }
          />
          <div>
            <TextField
              label="Sync interval minutes"
              value={settings.connectorSyncIntervalMinutes}
              placeholder="60"
              onChange={(connectorSyncIntervalMinutes) =>
                updateSettings({ connectorSyncIntervalMinutes })
              }
            />
            <FieldError
              message={getFieldError("connectorSyncIntervalMinutes")}
            />
          </div>
          <TextField
            label="Base URL"
            value={settings.connectorBaseUrl}
            placeholder="https://connector.local"
            onChange={(connectorBaseUrl) =>
              updateSettings({ connectorBaseUrl })
            }
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <ToggleField
            label="Connector enabled"
            description="Desactivado por defecto hasta configurar permisos."
            checked={settings.connectorEnabled}
            onChange={(connectorEnabled) =>
              updateSettings({ connectorEnabled })
            }
          />
          <ToggleField
            label="Ingest findings"
            description="Permitir importar hallazgos desde el conector."
            checked={settings.connectorIngestFindings}
            onChange={(connectorIngestFindings) =>
              updateSettings({ connectorIngestFindings })
            }
          />
          <ToggleField
            label="Ingest assets"
            description="Permitir importar activos desde el conector."
            checked={settings.connectorIngestAssets}
            onChange={(connectorIngestAssets) =>
              updateSettings({ connectorIngestAssets })
            }
          />
          <ToggleField
            label="Requires approval"
            description="Requerir aprobación antes de sincronizar datos."
            checked={settings.connectorRequiresApproval}
            onChange={(connectorRequiresApproval) =>
              updateSettings({ connectorRequiresApproval })
            }
          />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm font-medium text-slate-100">
            Connector secret
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Estado actual:{" "}
            <span className="text-amber-200">
              {settings.connectorSecretConfigured
                ? "configurado"
                : "no configurado"}
            </span>
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Los tokens, API keys o credenciales reales deberán almacenarse en
            backend como secretos cifrados o referencias seguras.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
          <p className="text-sm font-medium text-amber-200">
            Sin sincronización desde frontend
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Esta pantalla solo define configuración local. Las conexiones reales
            deberán pasar por backend, validación de permisos, rate limits y
            auditoría.
          </p>
        </div>
      </SettingsSection>

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
