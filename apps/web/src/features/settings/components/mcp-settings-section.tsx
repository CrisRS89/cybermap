import { MCP_TRANSPORTS } from "../settings-options";
import { updateSettings } from "../settings-storage";
import type { CyberMapSettings } from "../settings-types";
import { SelectField } from "./select-field";
import { SettingsSection } from "./settings-section";
import { TextField } from "./text-field";
import { ToggleField } from "./toggle-field";

type McpSettingsSectionProps = {
  settings: CyberMapSettings;
};

export function McpSettingsSection({ settings }: McpSettingsSectionProps) {
  return (
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
          onChange={(mcpAllowedTools) => updateSettings({ mcpAllowedTools })}
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
  );
}
