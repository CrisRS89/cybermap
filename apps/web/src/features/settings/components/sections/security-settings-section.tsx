import { updateSettings } from "../../settings-storage";
import type { CyberMapSettings } from "../../settings-types";
import { SettingsSection } from "./settings-section";
import { ToggleField } from "../fields/toggle-field";

type SecuritySettingsSectionProps = {
  settings: CyberMapSettings;
};

export function SecuritySettingsSection({
  settings,
}: SecuritySettingsSectionProps) {
  return (
    <SettingsSection
      id="security"
      eyebrow="Security"
      title="Políticas de seguridad"
      description="Controles globales de ejecución segura. Los defaults priorizan aprobación humana, sandbox y auditoría."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <ToggleField
          label="Aprobación humana"
          description="Requerir confirmación antes de ejecutar acciones sensibles."
          checked={settings.requireHumanApproval}
          onChange={(requireHumanApproval) =>
            updateSettings({ requireHumanApproval })
          }
        />
        <ToggleField
          label="Sandbox"
          description="Mantener acciones de riesgo en entornos aislados."
          checked={settings.sandboxEnabled}
          onChange={(sandboxEnabled) => updateSettings({ sandboxEnabled })}
        />
        <ToggleField
          label="Audit logs"
          description="Registrar eventos críticos para trazabilidad."
          checked={settings.auditLogsEnabled}
          onChange={(auditLogsEnabled) =>
            updateSettings({ auditLogsEnabled })
          }
        />
      </div>
    </SettingsSection>
  );
}
