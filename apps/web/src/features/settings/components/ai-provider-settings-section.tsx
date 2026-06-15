import {
  AI_PRIVACY_MODES,
  AI_PROVIDERS,
  THINKING_MODES,
} from "../settings-options";
import { updateSettings } from "../settings-storage";
import type { CyberMapSettings } from "../settings-types";
import { SelectField } from "./select-field";
import { SettingsSection } from "./settings-section";
import { TextField } from "./text-field";

type AiProviderSettingsSectionProps = {
  settings: CyberMapSettings;
  getFieldError: (field: string) => string | undefined;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-xs text-amber-200">{message}</p>;
}

export function AiProviderSettingsSection({
  settings,
  getFieldError,
}: AiProviderSettingsSectionProps) {
  return (
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

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm font-medium text-slate-100">API key</p>
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
  );
}
