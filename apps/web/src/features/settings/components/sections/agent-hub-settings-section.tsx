import {
  AGENT_INTEGRATION_TYPES,
  AGENT_PRESETS,
} from "../../settings-options";
import { updateSettings } from "../../settings-storage";
import type { CyberMapSettings } from "../../settings-types";
import { SelectField } from "../fields/select-field";
import { SettingsSection } from "./settings-section";
import { TextField } from "../fields/text-field";
import { ToggleField } from "../fields/toggle-field";

type AgentHubSettingsSectionProps = {
  settings: CyberMapSettings;
  getFieldError: (field: string) => string | undefined;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-xs text-amber-200">{message}</p>;
}

export function AgentHubSettingsSection({
  settings,
  getFieldError,
}: AgentHubSettingsSectionProps) {
  return (
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
        <div>
          <TextField
            label="Timeout segundos"
            value={settings.agentTimeoutSeconds}
            placeholder="120"
            onChange={(agentTimeoutSeconds) =>
              updateSettings({ agentTimeoutSeconds })
            }
          />
          <FieldError message={getFieldError("agentTimeoutSeconds")} />
        </div>
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
          ejecución real de agentes deberá pasar por backend, sandbox, permisos
          y auditoría.
        </p>
      </div>
    </SettingsSection>
  );
}
