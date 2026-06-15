import { BACKGROUNDS, THEMES } from "../../settings-options";
import { updateSettings } from "../../settings-storage";
import type { CyberMapSettings } from "../../settings-types";
import { SelectField } from "../fields/select-field";
import { SettingsSection } from "./settings-section";

type AppearanceSettingsSectionProps = {
  settings: CyberMapSettings;
};

export function AppearanceSettingsSection({
  settings,
}: AppearanceSettingsSectionProps) {
  return (
    <SettingsSection
      id="appearance"
      eyebrow="Appearance"
      title="Apariencia"
      description="Configura tema visual y fondo del dashboard. En esta fase la persistencia es local."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Tema"
          value={settings.theme}
          options={THEMES}
          onChange={(theme) => updateSettings({ theme })}
        />
        <SelectField
          label="Fondo"
          value={settings.background}
          options={BACKGROUNDS}
          onChange={(background) => updateSettings({ background })}
        />
      </div>
    </SettingsSection>
  );
}
