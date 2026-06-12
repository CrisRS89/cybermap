"use client";
import { useState, useEffect } from "react";

const THEMES = ["Dark Pro", "Dracula", "Hacking Green", "Claude Warm"];
const BACKGROUNDS = ["Nodos", "Cuadrícula", "Puntos", "Ninguno"];
const LANGUAGES = ["ES", "EN"];

const LOCAL_STORAGE_KEY = "cybermap_settings";

export function SettingsForm() {
  const [theme, setTheme] = useState(THEMES[0]);
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);

  // Cargar configuración desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.theme) setTheme(data.theme);
      if (data.background) setBackground(data.background);
      if (data.language) setLanguage(data.language);
    }
  }, []);

  // Guardar configuración automáticamente
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ theme, background, language })
    );
  }, [theme, background, language]);

  return (
    <div className="space-y-6 rounded-3xl border border-cyan-400/10 bg-slate-950/55 p-6 shadow-2xl shadow-cyan-950/20">
      <h2 className="text-xl font-semibold text-slate-100">Apariencia</h2>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Tema:</label>
        <select
          className="rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2 text-slate-100"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          {THEMES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Fondo:</label>
        <select
          className="rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2 text-slate-100"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
        >
          {BACKGROUNDS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <h2 className="text-xl font-semibold text-slate-100 mt-6">Idioma</h2>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Seleccionar idioma:</label>
        <select
          className="rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2 text-slate-100"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
