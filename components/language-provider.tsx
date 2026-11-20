"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import pt from "@/locales/pt.json";
import { localizePath, splitLocale, type Language } from "@/lib/i18n";

export type { Language } from "@/lib/i18n";

type Messages = typeof en;

type LanguageContextValue = {
  language: Language;
  /** Troca de idioma = ir para a mesma página na URL do outro idioma. */
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  messages: Messages;
  /** Caminho atual sem o prefixo de idioma ("/en/sudoku" → "/sudoku"). */
  path: string;
};

const STORAGE_KEY = "puzzled-language";
const dictionaries: Record<Language, Messages> = { en, pt, es };

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getMessage(messages: Messages, key: string) {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, messages);

  return typeof value === "string" ? value : key;
}

/**
 * O idioma vem da URL (o layout de cada idioma passa `language`), então o HTML já chega
 * traduzido do servidor. Trocar de idioma navega para a URL equivalente no outro idioma.
 */
export function LanguageProvider({ language, children }: { language: Language; children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const path = splitLocale(pathname).path;

  const setLanguage = useCallback(
    (next: Language) => {
      if (next === language) {
        return;
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Sem storage: a troca funciona igual, só não fica lembrada.
      }
      // Cada idioma tem seu próprio layout raiz (<html lang>), então é uma navegação completa.
      window.location.assign(`${localizePath(path, next)}${window.location.search}${window.location.hash}`);
    },
    [language, path],
  );

  const messages = dictionaries[language];
  const t = useMemo(() => (key: string) => getMessage(messages, key), [messages]);
  const value = useMemo(() => ({ language, setLanguage, t, messages, path }), [language, setLanguage, t, messages, path]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
