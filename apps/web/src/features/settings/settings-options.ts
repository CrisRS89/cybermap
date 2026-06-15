import type { CyberMapSettings } from "./settings-types";

export const THEMES = [
  "Dark Pro",
  "Dracula",
  "Hacking Green",
  "Claude Warm",
] as const;

export const BACKGROUNDS = [
  "Nodos",
  "Cuadrícula",
  "Puntos",
  "Ninguno",
] as const;

export const LANGUAGES = ["ES", "EN"] as const;

export const AI_PROVIDERS = [
  "OpenAI",
  "Gemini",
  "Claude",
  "OpenRouter",
  "Ollama",
  "LM Studio",
  "Custom",
] as const;

export const THINKING_MODES = [
  "Rápido",
  "Balanceado",
  "Profundo",
  "Estructurado",
  "Sin razonamiento extendido",
] as const;

export const AI_PRIVACY_MODES = [
  "Cloud",
  "Local only",
  "Redacted context",
] as const;

export const AGENT_PRESETS = [
  "Aider",
  "Cline",
  "OpenCode",
  "Custom CLI",
] as const;

export const AGENT_INTEGRATION_TYPES = [
  "cli",
  "api",
  "mcp",
  "ide_bridge",
  "framework",
] as const;

export const MCP_TRANSPORTS = ["stdio", "http"] as const;

export const CONNECTOR_PRESETS = [
  "Nmap",
  "Nuclei",
  "Wazuh",
  "TheHive",
  "MISP",
  "Custom",
] as const;

export const CONNECTOR_AUTH_MODES = [
  "none",
  "api_key",
  "bearer_token",
  "basic",
] as const;

export const defaultSettings: CyberMapSettings = {
  theme: THEMES[0],
  background: BACKGROUNDS[0],
  language: LANGUAGES[0],
  aiProvider: AI_PROVIDERS[0],
  aiModel: "gpt-4.1-mini",
  aiBaseUrl: "",
  thinkingMode: THINKING_MODES[1],
  aiTemperature: "0.2",
  aiMaxTokens: "2048",
  aiPrivacyMode: AI_PRIVACY_MODES[0],
  aiApiKeyConfigured: false,
  agentPreset: AGENT_PRESETS[0],
  agentIntegrationType: AGENT_INTEGRATION_TYPES[0],
  agentCommand: "",
  agentWorkingDirectory: "",
  agentTimeoutSeconds: "120",
  agentRequiresApproval: true,
  agentSandboxEnabled: true,
  agentNetworkAccess: false,
  mcpEnabled: false,
  mcpServerName: "",
  mcpTransport: MCP_TRANSPORTS[0],
  mcpCommand: "",
  mcpArgs: "",
  mcpUrl: "",
  mcpAllowedTools: "",
  mcpRequiresApproval: true,
  connectorEnabled: false,
  connectorPreset: CONNECTOR_PRESETS[0],
  connectorBaseUrl: "",
  connectorAuthMode: CONNECTOR_AUTH_MODES[0],
  connectorSecretConfigured: false,
  connectorSyncIntervalMinutes: "60",
  connectorIngestFindings: true,
  connectorIngestAssets: true,
  connectorRequiresApproval: true,
  requireHumanApproval: true,
  sandboxEnabled: true,
  auditLogsEnabled: true,
};
