"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  AGENT_PRESETS,
  AI_PROVIDERS,
  BACKGROUNDS,
  CONNECTOR_PRESETS,
  LANGUAGES,
  MCP_TRANSPORTS,
  THEMES,
  THINKING_MODES,
} from "../settings-options";
import {
  parseSettings,
  readServerSettingsRawSnapshot,
  readSettingsRawSnapshot,
  subscribeToSettingsChanges,
  updateSettings,
} from "../settings-storage";
import { SelectField } from "./select-field";
import { SettingsSection } from "./settings-section";
import { TextField } from "./text-field";
import { ToggleField } from "./toggle-field";

export function SettingsForm() {
  const rawSettings = useSyncExternalStore(
    subscribeToSettingsChanges,
    readSettingsRawSnapshot,
    readServerSettingsRawSnapshot
  );

  const settings = useMemo(() => parseSettings(rawSettings), [rawSettings]);

  return (
    <div className="space-y-6">
      <SettingsSection
        eyebrow="Appearance"
        title="Apariencia"
        description="Configura tema visual y fondo del dashboard. En esta fase la persistencia es local."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Tema"
            value={settings.theme}
            options={THEMES}
            onChange={(theme) => updateSettings({ theme })}
          />
          <SelectField
            label="Fondo"
            value={settings.background}
            options={BACKGROUNDS}
            onChange={(background) => updateSettings({ background })}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        eyebrow="Language"
        title="Idioma"
        description="Selector inicial de idioma. La internacionalización real se implementará luego con archivos de traducción."
      >
        <div className="max-w-sm">
          <SelectField
            label="Idioma"
            value={settings.language}
            options={LANGUAGES}
            onChange={(language) => updateSettings({ language })}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        eyebrow="AI Provider Gateway"
        title="Proveedores de IA"
        description="Define proveedor, modelo y modo de razonamiento. Las API keys reales no deben guardarse en frontend."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <SelectField
            label="Proveedor"
            value={settings.aiProvider}
            options={AI_PROVIDERS}
            onChange={(aiProvider) => updateSettings({ aiProvider })}
          />
          <TextField
            label="Modelo"
            value={settings.aiModel}
            placeholder="gpt-4.1-mini"
            onChange={(aiModel) => updateSettings({ aiModel })}
          />
          <SelectField
            label="Thinking mode"
            value={settings.thinkingMode}
            options={THINKING_MODES}
            onChange={(thinkingMode) => updateSettings({ thinkingMode })}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
          <p className="text-sm font-medium text-amber-200">
            Seguridad de secretos
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Esta UI no guarda API keys. Más adelante se enviarán al backend y se
            almacenarán como referencias cifradas o variables seguras.
          </p>
        </div>
      </SettingsSection>

      <SettingsSection
        eyebrow="Agent Hub"
        title="Agentes"
        description="Configura el preset inicial de agentes. Las acciones sensibles requerirán aprobación humana."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Preset de agente"
            value={settings.agentPreset}
            options={AGENT_PRESETS}
            onChange={(agentPreset) => updateSettings({ agentPreset })}
          />
          <TextField
            label="Comando custom"
            value=""
            placeholder="Ejemplo: aider --yes"
            onChange={() => undefined}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        eyebrow="MCP"
        title="MCP Servers"
        description="Configuración visual inicial para servidores MCP por transporte stdio o HTTP."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Transporte"
            value={settings.mcpTransport}
            options={MCP_TRANSPORTS}
            onChange={(mcpTransport) => updateSettings({ mcpTransport })}
          />
          <TextField
            label="Comando o URL"
            value=""
            placeholder="python server.py | http://localhost:8787"
            onChange={() => undefined}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        eyebrow="Connectors"
        title="Conectores"
        description="Punto de entrada para herramientas externas. En fases futuras se agregará test de conexión."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Conector inicial"
            value={settings.connectorPreset}
            options={CONNECTOR_PRESETS}
            onChange={(connectorPreset) => updateSettings({ connectorPreset })}
          />
          <TextField
            label="Endpoint opcional"
            value=""
            placeholder="https://connector.local"
            onChange={() => undefined}
          />
        </div>
      </SettingsSection>

      <SettingsSection
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
