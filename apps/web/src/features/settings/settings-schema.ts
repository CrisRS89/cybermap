import type { CyberMapSettings } from "./settings-types";

export type NumericSettingKind = "number" | "integer";

export type NumericSettingValidationRule = {
  field: keyof CyberMapSettings;
  kind: NumericSettingKind;
  min: number;
  max: number;
};

/**
 * Reglas declarativas para campos numéricos de Settings.
 *
 * Propósito:
 * - documentar constraints en un lugar único
 * - preparar validación schema-driven
 * - evitar duplicación de min/max en UI, tests o backend futuro
 */
export const NUMERIC_SETTING_VALIDATION_RULES = [
  {
    field: "aiTemperature",
    kind: "number",
    min: 0,
    max: 2,
  },
  {
    field: "aiMaxTokens",
    kind: "integer",
    min: 1,
    max: 128000,
  },
  {
    field: "agentTimeoutSeconds",
    kind: "integer",
    min: 1,
    max: 3600,
  },
  {
    field: "connectorSyncIntervalMinutes",
    kind: "integer",
    min: 1,
    max: 1440,
  },
] satisfies NumericSettingValidationRule[];

export type SettingsSectionId =
  | "appearance"
  | "language"
  | "ai-providers"
  | "agents"
  | "mcp"
  | "connectors"
  | "security";

export type SettingsSectionSchema = {
  id: SettingsSectionId;
  eyebrow: string;
  title: string;
  description: string;
};

/**
 * Metadata declarativa de secciones.
 *
 * Propósito:
 * - documentar orden e identidad de secciones
 * - preparar navegación y render futuro desde schema
 * - evitar divergencias entre navegación interna y componentes
 */
export const SETTINGS_SECTION_SCHEMAS = [
  {
    id: "appearance",
    eyebrow: "Appearance",
    title: "Apariencia",
    description: "Tema, fondo y experiencia visual de CyberMap.",
  },
  {
    id: "language",
    eyebrow: "Language",
    title: "Idioma",
    description:
      "Selector inicial de idioma. La internacionalización real se implementará luego con archivos de traducción.",
  },
  {
    id: "ai-providers",
    eyebrow: "AI Provider Gateway",
    title: "Proveedores de IA",
    description:
      "Define proveedor, modelo, modo de razonamiento y parámetros de generación. Las API keys reales no deben guardarse en frontend.",
  },
  {
    id: "agents",
    eyebrow: "Agent Hub",
    title: "Agentes",
    description:
      "Configura agentes locales o externos. No se ejecuta ningún agente desde esta pantalla.",
  },
  {
    id: "mcp",
    eyebrow: "MCP",
    title: "MCP Servers",
    description:
      "Configuración visual inicial para servidores MCP. No se inicia ningún proceso ni conexión desde frontend.",
  },
  {
    id: "connectors",
    eyebrow: "Connectors",
    title: "Conectores",
    description:
      "Configura fuentes externas de datos. No se guardan secretos reales ni se ejecutan sincronizaciones desde frontend.",
  },
  {
    id: "security",
    eyebrow: "Security",
    title: "Políticas de seguridad",
    description:
      "Controles globales de ejecución segura. Los defaults priorizan aprobación humana, sandbox y auditoría.",
  },
] satisfies SettingsSectionSchema[];
