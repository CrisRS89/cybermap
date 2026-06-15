import { getSettingsSectionSchema } from "../../settings-schema";
import { LANGUAGES } from "../../settings-options";
import { updateSettings } from "../../settings-storage";
import type { CyberMapSettings } from "../../settings-types";
import { SelectField } from "../fields/select-field";
import { SettingsSection } from "./settings-section";

const sectionSchema = getSettingsSectionSchema("language");

type LanguageSettingsSectionProps = {
  settings: CyberMapSettings;
};

export function LanguageSettingsSection({
  settings,
}: LanguageSettingsSectionProps) {
  return (
    <SettingsSection
      id={sectionSchema.id}
      eyebrow={sectionSchema.eyebrow}
      title={sectionSchema.title}
      description={sectionSchema.description}
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
