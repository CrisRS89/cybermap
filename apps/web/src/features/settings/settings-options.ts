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

export const AGENT_PRESETS = [
  "Aider",
  "Cline",
  "OpenCode",
  "Custom CLI",
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

export const defaultSettings: CyberMapSettings = {
  theme: THEMES[0],
  background: BACKGROUNDS[0],
  language: LANGUAGES[0],
  aiProvider: AI_PROVIDERS[0],
  aiModel: "gpt-4.1-mini",
  thinkingMode: THINKING_MODES[1],
  agentPreset: AGENT_PRESETS[0],
  mcpTransport: MCP_TRANSPORTS[0],
  connectorPreset: CONNECTOR_PRESETS[0],
  requireHumanApproval: true,
  sandboxEnabled: true,
  auditLogsEnabled: true,
};
