"use client";

import { useCyberMapSettings } from "@/features/settings/use-cybermap-settings";
import { getTranslation } from "./i18n";

export function useI18n() {
  const settings = useCyberMapSettings();
  const language = (settings.language === "EN" ? "EN" : "ES") as "ES" | "EN";

  return {
    t: (key: string, defaultValue?: string) => {
      const result = getTranslation(language, key);
      return result === key && defaultValue ? defaultValue : result;
    },
    language,
  };
}
