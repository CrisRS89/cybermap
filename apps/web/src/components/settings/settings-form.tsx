"use client";

import { useMemo, useSyncExternalStore } from "react";

const THEMES = ["Dark Pro", "Dracula", "Hacking Green", "Claude Warm"] as const;
const BACKGROUNDS = ["Nodos", "Cuadrícula", "Puntos", "Ninguno"] as const;
const LANGUAGES = ["ES", "EN"] as const;

const LOCAL_STORAGE_KEY = "cybermap_settings";
const STORAGE_EVENT_NAME = "cybermap-settings-change";

type CyberMapSettings = {
  theme: string;
  background: string;
  language: string;
};

const defaultSettings: CyberMapSettings = {
  theme: THEMES[0],
  background: BACKGROUNDS[0],
  language: LANGUAGES[0],
};

const defaultSettingsRaw = JSON.stringify(defaultSettings);

/**
 * Devuelve un snapshot primitivo y estable.
 * useSyncExternalStore no debe recibir objetos nuevos en cada render.
 */
function readSettingsRawSnapshot(): string {
  if (typeof window === "undefined") {
    return defaultSettingsRaw;
  }

  return window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? defaultSettingsRaw;
}

/**
 * Snapshot usado durante SSR.
 */
function readServerSettingsRawSnapshot(): string {
  return defaultSettingsRaw;
}

/**
 * Suscribe React a cambios de localStorage.
 */
function subscribeToSettingsChanges(onStoreChange: () => void) {
  window.addEventListener(STORAGE_EVENT_NAME, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(STORAGE_EVENT_NAME, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

/**
 * Convierte el string persistido en configuración segura.
 * Si el JSON está corrupto o incompleto, vuelve a defaults.
 */
function parseSettings(rawSettings: string): CyberMapSettings {
  try {
    const parsedSettings = JSON.parse(rawSettings) as Partial<CyberMapSettings>;

    return {
      theme: parsedSettings.theme ?? defaultSettings.theme,
      background: parsedSettings.background ?? defaultSettings.background,
      language: parsedSettings.language ?? defaultSettings.language,
    };
  } catch {
    return defaultSettings;
  }
}

/**
 * Persiste una actualización parcial y notifica a React.
 */
function updateSettings(nextSettings: Partial<CyberMapSettings>) {
  const currentSettings = parseSettings(readSettingsRawSnapshot());
  const updatedSettings = {
    ...currentSettings,
    ...nextSettings,
  };

  window.localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(updatedSettings)
  );

  window.dispatchEvent(new Event(STORAGE_EVENT_NAME));
}

export function SettingsForm() {
  const rawSettings = useSyncExternalStore(
    subscribeToSettingsChanges,
    readSettingsRawSnapshot,
    readServerSettingsRawSnapshot
  );

  const settings = useMemo(() => parseSettings(rawSettings), [rawSettings]);

  return (
    <div className="space-y-6 rounded-3xl border border-cyan-400/10 bg-slate-950/55 p-6 shadow-2xl shadow-cyan-950/20">
      <section className="space-y-4">
        <div>
          <p className="text-sm text-cyan-300">Appearance</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-100">
            Apariencia
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Configuración visual local. En esta fase se guarda en el navegador
            mediante localStorage.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-slate-400">Tema</span>
            <select
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400/50"
              value={settings.theme}
              onChange={(event) =>
                updateSettings({ theme: event.target.value })
              }
            >
              {THEMES.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-slate-400">Fondo</span>
            <select
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400/50"
              value={settings.background}
              onChange={(event) =>
                updateSettings({ background: event.target.value })
              }
            >
              {BACKGROUNDS.map((background) => (
                <option key={background} value={background}>
                  {background}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4 border-t border-slate-800 pt-6">
        <div>
          <p className="text-sm text-cyan-300">Language</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-100">
            Idioma
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Selector inicial de idioma. La internacionalización real se
            implementará después con archivos de traducción.
          </p>
        </div>

        <label className="flex max-w-sm flex-col gap-2">
          <span className="text-sm text-slate-400">Seleccionar idioma</span>
          <select
            className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400/50"
            value={settings.language}
            onChange={(event) =>
              updateSettings({ language: event.target.value })
            }
          >
            {LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
        <p className="text-sm font-medium text-amber-200">
          Persistencia temporal
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Estos valores se guardan localmente en el navegador. Más adelante se
          moverán a configuración de usuario en backend, con validación y
          auditoría.
        </p>
      </section>
    </div>
  );
}
