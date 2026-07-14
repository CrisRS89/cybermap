import { getSettingsSectionSchema } from "../../settings-schema";
import {
  AI_PRIVACY_MODES,
  AI_PROVIDERS,
  THINKING_MODES,
} from "../../settings-options";
import { updateSettings } from "../../settings-storage";
import type { CyberMapSettings } from "../../settings-types";
import { FieldError } from "../fields/field-error";
import { SelectField } from "../fields/select-field";
import { TextField } from "../fields/text-field";
import { SettingsSection } from "./settings-section";

const sectionSchema = getSettingsSectionSchema("ai-providers");

type AiProviderSettingsSectionProps = {
  settings: CyberMapSettings;
  getFieldError: (field: string) => string | undefined;
};

export function AiProviderSettingsSection({
  settings,
  getFieldError,
}: AiProviderSettingsSectionProps) {
  return (
    <SettingsSection
      id={sectionSchema.id}
      eyebrow={sectionSchema.eyebrow}
      title={sectionSchema.title}
      description={sectionSchema.description}
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
        <div>
          <TextField
            label="Temperature"
            value={settings.aiTemperature}
            placeholder="0.2"
            onChange={(aiTemperature) => updateSettings({ aiTemperature })}
          />
          <FieldError message={getFieldError("aiTemperature")} />
        </div>
        <div>
          <TextField
            label="Max tokens"
            value={settings.aiMaxTokens}
            placeholder="2048"
            onChange={(aiMaxTokens) => updateSettings({ aiMaxTokens })}
          />
          <FieldError message={getFieldError("aiMaxTokens")} />
        </div>
        <SelectField
          label="Privacy mode"
          value={settings.aiPrivacyMode}
          options={AI_PRIVACY_MODES}
          onChange={(aiPrivacyMode) => updateSettings({ aiPrivacyMode })}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <p className="text-sm font-medium text-slate-100">
          Credenciales de proveedor
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          La clave no se guarda ni se solicita desde el navegador. Configurá la
          variable correspondiente en el entorno del backend: `OPENAI_API_KEY`,
          `OPENROUTER_API_KEY` o `CYBERMAP_AI_CUSTOM_API_KEY`.
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Ollama y LM Studio se conectan mediante sus URLs locales configuradas
          en el backend. El análisis de Exploration usa el proveedor y modelo
          seleccionados arriba.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
        <p className="text-sm font-medium text-amber-200">
          Seguridad de secretos
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Esta UI no guarda API keys. CyberMap las lee exclusivamente desde las
          variables de entorno del backend.
        </p>
      </div>
    </SettingsSection>
  );
}
