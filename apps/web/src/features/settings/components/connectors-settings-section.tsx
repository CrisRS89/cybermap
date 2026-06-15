import {
  CONNECTOR_AUTH_MODES,
  CONNECTOR_PRESETS,
} from "../settings-options";
import { updateSettings } from "../settings-storage";
import type { CyberMapSettings } from "../settings-types";
import { SelectField } from "./select-field";
import { SettingsSection } from "./settings-section";
import { TextField } from "./text-field";
import { ToggleField } from "./toggle-field";

type ConnectorsSettingsSectionProps = {
  settings: CyberMapSettings;
  getFieldError: (field: string) => string | undefined;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-xs text-amber-200">{message}</p>;
}

export function ConnectorsSettingsSection({
  settings,
  getFieldError,
}: ConnectorsSettingsSectionProps) {
  return (
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
          onChange={(connectorPreset) => updateSettings({ connectorPreset })}
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
  );
}
