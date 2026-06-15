"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  AGENT_INTEGRATION_TYPES,
  AGENT_PRESETS,
  AI_PRIVACY_MODES,
  AI_PROVIDERS,
  BACKGROUNDS,
  CONNECTOR_AUTH_MODES,
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
        id="appearance"
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
        id="language"
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
        id="ai-providers"
        eyebrow="AI Provider Gateway"
        title="Proveedores de IA"
        description="Define proveedor, modelo, modo de razonamiento y parámetros de generación. Las API keys reales no deben guardarse en frontend."
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
          <TextField
            label="Base URL"
            value={settings.aiBaseUrl}
            placeholder="https://api.openai.com/v1"
            onChange={(aiBaseUrl) => updateSettings({ aiBaseUrl })}
          />
          <SelectField
            label="Thinking mode"
            value={settings.thinkingMode}
            options={THINKING_MODES}
            onChange={(thinkingMode) => updateSettings({ thinkingMode })}
          />
          <TextField
            label="Temperature"
            value={settings.aiTemperature}
            placeholder="0.2"
            onChange={(aiTemperature) => updateSettings({ aiTemperature })}
          />
          <TextField
            label="Max tokens"
            value={settings.aiMaxTokens}
            placeholder="2048"
            onChange={(aiMaxTokens) => updateSettings({ aiMaxTokens })}
          />
          <SelectField
            label="Privacy mode"
            value={settings.aiPrivacyMode}
            options={AI_PRIVACY_MODES}
            onChange={(aiPrivacyMode) => updateSettings({ aiPrivacyMode })}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-sm font-medium text-slate-100">
              API key
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Estado actual:{" "}
              <span className="text-amber-200">
                {settings.aiApiKeyConfigured ? "configurada" : "no configurada"}
              </span>
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              La clave real deberá guardarse luego vía backend como secreto
              cifrado o referencia segura. No se persiste en localStorage.
            </p>
          </div>

          <button
            type="button"
            className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 opacity-70"
            disabled
          >
            Test connection próximamente
          </button>
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
        id="agents"
        eyebrow="Agent Hub"
        title="Agentes"
        description="Configura agentes locales o externos. No se ejecuta ningún agente desde esta pantalla."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <SelectField
            label="Preset de agente"
            value={settings.agentPreset}
            options={AGENT_PRESETS}
            onChange={(agentPreset) => updateSettings({ agentPreset })}
          />
          <SelectField
            label="Tipo de integración"
            value={settings.agentIntegrationType}
            options={AGENT_INTEGRATION_TYPES}
            onChange={(agentIntegrationType) =>
              updateSettings({ agentIntegrationType })
            }
          />
          <TextField
            label="Timeout segundos"
            value={settings.agentTimeoutSeconds}
            placeholder="120"
            onChange={(agentTimeoutSeconds) =>
              updateSettings({ agentTimeoutSeconds })
            }
          />
          <TextField
            label="Comando"
            value={settings.agentCommand}
            placeholder="Ejemplo: aider --yes"
            onChange={(agentCommand) => updateSettings({ agentCommand })}
          />
          <TextField
            label="Working directory"
            value={settings.agentWorkingDirectory}
            placeholder="/workspace/project"
            onChange={(agentWorkingDirectory) =>
              updateSettings({ agentWorkingDirectory })
            }
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <ToggleField
            label="Aprobación por agente"
            description="Requerir confirmación antes de ejecutar tareas de agente."
            checked={settings.agentRequiresApproval}
            onChange={(agentRequiresApproval) =>
              updateSettings({ agentRequiresApproval })
            }
          />
          <ToggleField
            label="Sandbox de agente"
            description="Ejecutar agentes en entorno aislado cuando esté disponible."
            checked={settings.agentSandboxEnabled}
            onChange={(agentSandboxEnabled) =>
              updateSettings({ agentSandboxEnabled })
            }
          />
          <ToggleField
            label="Acceso de red"
            description="Desactivado por defecto para reducir riesgo operativo."
            checked={settings.agentNetworkAccess}
            onChange={(agentNetworkAccess) =>
              updateSettings({ agentNetworkAccess })
            }
          />
        </div>

        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
          <p className="text-sm font-medium text-amber-200">
            Ejecución deshabilitada
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Esta sección solo define configuración visual y contrato local. La
            ejecución real de agentes deberá pasar por backend, sandbox,
            permisos y auditoría.
          </p>
        </div>
      </SettingsSection>

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
          <TextField
            label="Sync interval minutes"
            value={settings.connectorSyncIntervalMinutes}
            placeholder="60"
            onChange={(connectorSyncIntervalMinutes) =>
              updateSettings({ connectorSyncIntervalMinutes })
            }
          />
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
