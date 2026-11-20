"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import pt from "@/locales/pt.json";

export type Language = "en" | "pt" | "es";

type Messages = typeof en;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  messages: Messages;
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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "pt" || saved === "es") {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const messages = dictionaries[language];
  const pathname = usePathname();

  // O título vem do metadata do servidor, sempre em português. Para as páginas fixas,
  // aplica o título do idioma escolhido e o reaplica se o Next trocar o <title> na navegação.
  useEffect(() => {
    const pageKey = pathname === "/" ? "home" : pathname.slice(1);
    const titles = messages.pageTitles as Record<string, string>;
    const desired = titles[pageKey];
    if (!desired) {
      return;
    }
    const apply = () => {
      if (document.title !== desired) {
        document.title = desired;
      }
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname, messages]);
  const t = useMemo(() => (key: string) => getMessage(messages, key), [messages]);
  const value = useMemo(() => ({ language, setLanguage, t, messages }), [language, messages, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
