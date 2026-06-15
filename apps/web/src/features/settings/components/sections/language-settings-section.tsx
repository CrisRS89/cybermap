import { LANGUAGES } from "../../settings-options";
import { updateSettings } from "../../settings-storage";
import type { CyberMapSettings } from "../../settings-types";
import { SelectField } from "../fields/select-field";
import { SettingsSection } from "./settings-section";

type LanguageSettingsSectionProps = {
  settings: CyberMapSettings;
};

export function LanguageSettingsSection({
  settings,
}: LanguageSettingsSectionProps) {
  return (
    <SettingsSection
      id="language"
      eyebrow="Language"
      title="Idioma"
      description="Selector inicial de idioma. La internacionalización real se implementará luego con archivos de traducción."
    >
      <div className="max-w-sm">
        <SelectField
          label="Idioma"
          value={settings.language}
          options={LANGUAGES}
          onChange={(language) => updateSettings({ language })}
        />
      </div>
    </SettingsSection>
  );
}
