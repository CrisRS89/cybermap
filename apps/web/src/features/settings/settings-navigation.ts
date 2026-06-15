import { SETTINGS_SECTION_SCHEMAS } from "./settings-schema";
import type { SettingsSectionId } from "./settings-schema";

const SETTINGS_NAVIGATION_DESCRIPTIONS: Record<SettingsSectionId, string> = {
  appearance: "Tema y fondo",
  language: "Idioma de UI",
  "ai-providers": "Proveedor y modelo",
  agents: "Agentes locales",
  mcp: "Servidores MCP",
  connectors: "Integraciones externas",
  security: "Políticas seguras",
};

export const settingsNavigationItems = SETTINGS_SECTION_SCHEMAS.map(
  (section) => ({
    id: section.id,
    label: section.eyebrow,
    description: SETTINGS_NAVIGATION_DESCRIPTIONS[section.id],
  })
);
