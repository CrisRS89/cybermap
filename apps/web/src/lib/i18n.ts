import es from '@/locales/es.json'
import en from '@/locales/en.json'

type Language = 'ES' | 'EN'
type TranslationTree = {
  [key: string]: string | TranslationTree
}

const translations: Record<Language, TranslationTree> = {
  ES: es,
  EN: en,
}

export function getTranslation(language: Language, key: string): string {
  const keys = key.split('.')
  let value: string | TranslationTree = translations[language]

  for (const k of keys) {
    if (typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key
    }
  }

  return typeof value === 'string' ? value : key
}

export function useTranslation(language: Language) {
  return {
    t: (key: string, defaultValue?: string) => {
      const result = getTranslation(language, key)
      return result === key && defaultValue ? defaultValue : result
    },
  }
}
