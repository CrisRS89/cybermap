"use client";

import { useMemo, useSyncExternalStore } from "react";

const THEMES = ["Dark Pro", "Dracula", "Hacking Green", "Claude Warm"] as const;
const BACKGROUNDS = ["Nodos", "Cuadrícula", "Puntos", "Ninguno"] as const;
const LANGUAGES = ["ES", "EN"] as const;
const AI_PROVIDERS = [
  "OpenAI",
  "Gemini",
  "Claude",
  "OpenRouter",
  "Ollama",
  "LM Studio",
  "Custom",
] as const;
const THINKING_MODES = [
  "Rápido",
  "Balanceado",
  "Profundo",
  "Estructurado",
  "Sin razonamiento extendido",
] as const;

const LOCAL_STORAGE_KEY = "cybermap_settings";
const STORAGE_EVENT_NAME = "cybermap-settings-change";

type CyberMapSettings = {
  theme: string;
  background: string;
  language: string;
  aiProvider: string;
  aiModel: string;
  thinkingMode: string;
  agentPreset: string;
  mcpTransport: string;
  connectorPreset: string;
  requireHumanApproval: boolean;
  sandboxEnabled: boolean;
  auditLogsEnabled: boolean;
};

const defaultSettings: CyberMapSettings = {
  theme: THEMES[0],
  background: BACKGROUNDS[0],
  language: LANGUAGES[0],
  aiProvider: AI_PROVIDERS[0],
  aiModel: "gpt-4.1-mini",
  thinkingMode: THINKING_MODES[1],
  agentPreset: "Aider",
  mcpTransport: "stdio",
  connectorPreset: "Nmap",
  requireHumanApproval: true,
  sandboxEnabled: true,
  auditLogsEnabled: true,
};

const defaultSettingsRaw = JSON.stringify(defaultSettings);

function readSettingsRawSnapshot(): string {
  if (typeof window === "undefined") {
    return defaultSettingsRaw;
  }

  return window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? defaultSettingsRaw;
}

function readServerSettingsRawSnapshot(): string {
  return defaultSettingsRaw;
}

function subscribeToSettingsChanges(onStoreChange: () => void) {
  window.addEventListener(STORAGE_EVENT_NAME, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(STORAGE_EVENT_NAME, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function parseBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function parseSettings(rawSettings: string): CyberMapSettings {
  try {
    const parsedSettings = JSON.parse(rawSettings) as Partial<CyberMapSettings>;

    return {
      theme: parsedSettings.theme ?? defaultSettings.theme,
      background: parsedSettings.background ?? defaultSettings.background,
      language: parsedSettings.language ?? defaultSettings.language,
      aiProvider: parsedSettings.aiProvider ?? defaultSettings.aiProvider,
      aiModel: parsedSettings.aiModel ?? defaultSettings.aiModel,
      thinkingMode: parsedSettings.thinkingMode ?? defaultSettings.thinkingMode,
      agentPreset: parsedSettings.agentPreset ?? defaultSettings.agentPreset,
      mcpTransport:
        parsedSettings.mcpTransport ?? defaultSettings.mcpTransport,
      connectorPreset:
        parsedSettings.connectorPreset ?? defaultSettings.connectorPreset,
      requireHumanApproval: parseBoolean(
        parsedSettings.requireHumanApproval,
        defaultSettings.requireHumanApproval
      ),
      sandboxEnabled: parseBoolean(
        parsedSettings.sandboxEnabled,
        defaultSettings.sandboxEnabled
      ),
      auditLogsEnabled: parseBoolean(
        parsedSettings.auditLogsEnabled,
        defaultSettings.auditLogsEnabled
      ),
    };
  } catch {
    return defaultSettings;
  }
}

function updateSettings(nextSettings: Partial<CyberMapSettings>) {
  const currentSettings = parseSettings(readSettingsRawSnapshot());
  const updatedSettings = {
    ...currentSettings,
    ...nextSettings,
  };

  window.localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(updatedSettings)
  );

  window.dispatchEvent(new Event(STORAGE_EVENT_NAME));
}

type SettingsSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

function SettingsSection({
  eyebrow,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="rounded-3xl border border-cyan-400/10 bg-slate-950/55 p-5 shadow-2xl shadow-cyan-950/20 sm:p-6">
      <p className="text-sm text-cyan-300">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-100">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-slate-400">{label}</span>
      <select
        className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400/50"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  type?: "text" | "password";
  onChange: (value: string) => void;
};

function TextField({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: TextFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-slate-400">{label}</span>
      <input
        className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

type ToggleFieldProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: ToggleFieldProps) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <span>
        <span className="block text-sm font-medium text-slate-100">
          {label}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
      <input
        className="mt-1 h-5 w-5 accent-cyan-400"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

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
            options={["Aider", "Cline", "OpenCode", "Custom CLI"]}
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
            options={["stdio", "http"]}
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
            options={["Nmap", "Nuclei", "Wazuh", "TheHive", "MISP", "Custom"]}
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
