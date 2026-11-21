/**
 * Idiomas e rotas.
 * O português fica na raiz (/sudoku); inglês e espanhol ganham prefixo (/en/sudoku, /es/sudoku).
 * O idioma vem da URL, então o servidor já entrega a página traduzida.
 */
export const locales = ["pt", "en", "es"] as const;
export type Language = (typeof locales)[number];

/** Idiomas que usam prefixo na URL (o segmento [lang]). */
export const prefixedLocales = ["en", "es"] as const;
export type PrefixedLanguage = (typeof prefixedLocales)[number];

export const defaultLanguage: Language = "pt";
export const SITE_URL = "https://puzzled.com.br";

export const htmlLang: Record<Language, string> = { pt: "pt-BR", en: "en", es: "es" };
export const ogLocale: Record<Language, string> = { pt: "pt_BR", en: "en_US", es: "es_ES" };
export const numberLocale: Record<Language, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };

export function isLanguage(value: string): value is Language {
  return (locales as readonly string[]).includes(value);
}

export function isPrefixedLanguage(value: string): value is PrefixedLanguage {
  return (prefixedLocales as readonly string[]).includes(value);
}

/** "/sudoku" + "en" → "/en/sudoku"; "/" + "es" → "/es"; "/#jogos" + "en" → "/en#jogos". Português fica igual. */
export function localizePath(path: string, language: Language) {
  if (language === defaultLanguage || !path.startsWith("/")) {
    return path;
  }
  if (path === "/") {
    return `/${language}`;
  }
  if (path.startsWith("/#") || path.startsWith("/?")) {
    return `/${language}${path.slice(1)}`;
  }
  return `/${language}${path}`;
}

/** "/en/sudoku" → { language: "en", path: "/sudoku" }; "/sudoku" → { language: "pt", path: "/sudoku" }. */
export function splitLocale(pathname: string): { language: Language; path: string } {
  const match = pathname.match(/^\/(en|es)(?=\/|$)/);
  if (!match) {
    return { language: defaultLanguage, path: pathname || "/" };
  }
  const rest = pathname.slice(match[0].length);
  return { language: match[1] as Language, path: rest || "/" };
}

export function absoluteUrl(path: string, language: Language) {
  const localized = localizePath(path, language);
  return `${SITE_URL}${localized === "/" ? "" : localized}`;
}
