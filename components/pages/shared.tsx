import { absoluteUrl, htmlLang, SITE_URL, type Language } from "@/lib/i18n";
import { getPageText } from "@/lib/page-meta";

/**
 * Peças compartilhadas pelas páginas em components/pages/*. Cada página fica em um arquivo
 * próprio para o bundle de uma página não levar o código dos outros jogos junto.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const gameNames: Record<"sudoku" | "snake" | "slide" | "tetris", Record<Language, string>> = {
  sudoku: { pt: "Sudoku", en: "Sudoku", es: "Sudoku" },
  snake: { pt: "Snake", en: "Snake", es: "Snake" },
  slide: { pt: "Racha Cuca | Slide Puzzle", en: "Sliding Puzzle", es: "Rompecabezas deslizante" },
  tetris: { pt: "Tetris", en: "Tetris", es: "Tetris" },
};

export function GameJsonLd({ game, language }: { game: keyof typeof gameNames; language: Language }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Game",
        name: gameNames[game][language],
        description: getPageText(game, language).description,
        url: absoluteUrl(`/${game}`, language),
        inLanguage: htmlLang[language],
        applicationCategory: "Game",
        operatingSystem: "All",
      }}
    />
  );
}

export { SITE_URL };
