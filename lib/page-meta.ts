import type { Metadata } from "next";
import { absoluteUrl, htmlLang, locales, ogLocale, SITE_URL, type Language } from "@/lib/i18n";

/** Páginas fixas do site e seus caminhos (sem prefixo de idioma). */
export const pagePaths = {
  home: "/",
  sudoku: "/sudoku",
  snake: "/snake",
  slide: "/slide",
  tetris: "/tetris",
  articles: "/articles",
  about: "/about",
  contact: "/contact",
  privacy: "/privacy",
} as const;
export type PageKey = keyof typeof pagePaths;

type PageText = { title: string; description: string; ogTitle?: string; ogDescription?: string };

const pageText: Record<PageKey, Record<Language, PageText>> = {
  home: {
    pt: {
      title: "Puzzled | Jogos online de lógica, sudoku e clássicos",
      description:
        "Jogue Sudoku, Snake, Racha Cuca e Tetris online. Leia guias de estratégia, aprenda técnicas de sudoku e descubra a história dos jogos clássicos.",
      ogTitle: "Puzzled | Jogos online de lógica",
      ogDescription: "Sudoku, Snake, Racha Cuca, Tetris e artigos para pensar melhor enquanto joga.",
    },
    en: {
      title: "Puzzled | Online logic games, sudoku and classics",
      description:
        "Play Sudoku, Snake, Sliding Puzzle and Tetris online. Read strategy guides, learn sudoku techniques and discover the history of classic games.",
      ogTitle: "Puzzled | Online logic games",
      ogDescription: "Sudoku, Snake, Sliding Puzzle, Tetris and articles to think better while you play.",
    },
    es: {
      title: "Puzzled | Juegos de lógica online, sudoku y clásicos",
      description:
        "Juega Sudoku, Snake, Rompecabezas deslizante y Tetris online. Lee guías de estrategia, aprende técnicas de sudoku y descubre la historia de los juegos clásicos.",
      ogTitle: "Puzzled | Juegos de lógica online",
      ogDescription: "Sudoku, Snake, Rompecabezas deslizante, Tetris y artículos para pensar mejor mientras juegas.",
    },
  },
  sudoku: {
    pt: {
      title: "Sudoku online grátis | Puzzled",
      description:
        "Jogue Sudoku online grátis com candidatos, marcações, impressão, compartilhamento e filtros para padrões como X-Wing e Swordfish.",
      ogDescription: "Um tabuleiro de Sudoku online com candidatos, marcações, impressão e ferramentas de estudo.",
    },
    en: {
      title: "Free online Sudoku | Puzzled",
      description:
        "Play Sudoku online for free with candidates, cell marks, printing, sharing and filters for patterns like X-Wing and Swordfish.",
      ogDescription: "An online Sudoku board with candidates, marks, printing and study tools.",
    },
    es: {
      title: "Sudoku online gratis | Puzzled",
      description:
        "Juega Sudoku online gratis con candidatos, marcas, impresión, opción de compartir y filtros para patrones como X-Wing y Swordfish.",
      ogDescription: "Un tablero de Sudoku online con candidatos, marcas, impresión y herramientas de estudio.",
    },
  },
  snake: {
    pt: {
      title: "Snake online grátis | Jogo da cobrinha | Puzzled",
      description:
        "Jogue Snake online grátis. Controle a cobra, colete comidas especiais, planeje rotas, bata seu recorde local e treine reflexos sem instalar nada.",
      ogDescription: "O clássico jogo da cobrinha no navegador, com pontuação, recorde local, boost e controles para desktop e mobile.",
    },
    en: {
      title: "Free online Snake | Classic snake game | Puzzled",
      description:
        "Play Snake online for free. Steer the snake, collect special food, plan your route, beat your local record and train your reflexes without installing anything.",
      ogDescription: "The classic snake game in your browser, with score, local record, boost and desktop and mobile controls.",
    },
    es: {
      title: "Snake online gratis | Juego de la serpiente | Puzzled",
      description:
        "Juega Snake online gratis. Controla la serpiente, recoge comida especial, planea rutas, supera tu récord local y entrena tus reflejos sin instalar nada.",
      ogDescription: "El clásico juego de la serpiente en el navegador, con puntuación, récord local, boost y controles para escritorio y móvil.",
    },
  },
  slide: {
    pt: {
      title: "Racha Cuca online | Slide Puzzle grátis | Puzzled",
      description:
        "Jogue Racha Cuca online grátis. Deslize peças numeradas, organize o tabuleiro em ordem crescente e tente concluir o Slide Puzzle em menos movimentos.",
      ogDescription: "Um quebra-cabeça deslizante de números para treinar ordem, espaço, planejamento e tempo.",
    },
    en: {
      title: "Online sliding puzzle | Free 15 puzzle | Puzzled",
      description:
        "Play the sliding puzzle online for free. Slide the numbered tiles, put the board in ascending order and try to finish in fewer moves.",
      ogDescription: "A sliding number puzzle to train order, space, planning and timing.",
    },
    es: {
      title: "Rompecabezas deslizante online | Slide Puzzle gratis | Puzzled",
      description:
        "Juega al rompecabezas deslizante online gratis. Desliza las piezas numeradas, ordena el tablero de forma ascendente e intenta terminar en menos movimientos.",
      ogDescription: "Un rompecabezas deslizante de números para entrenar orden, espacio, planificación y tiempo.",
    },
  },
  tetris: {
    pt: {
      title: "Tetris online | Puzzle de ação grátis | Puzzled",
      description:
        "Jogue Tetris online no navegador. Rotacione tetrominós, limpe linhas, use hold, acompanhe as próximas peças e treine decisões sob pressão.",
      ogDescription: "Tetrominós, linhas, hold, preview e pressão progressiva em uma versão online do clássico puzzle de ação.",
    },
    en: {
      title: "Online Tetris | Free action puzzle | Puzzled",
      description:
        "Play Tetris online in your browser. Rotate tetrominoes, clear lines, use hold, watch the next pieces and train decisions under pressure.",
      ogDescription: "Tetrominoes, lines, hold, preview and rising pressure in an online version of the classic action puzzle.",
    },
    es: {
      title: "Tetris online | Puzzle de acción gratis | Puzzled",
      description:
        "Juega Tetris online en el navegador. Gira tetrominós, limpia líneas, usa hold, sigue las próximas piezas y entrena decisiones bajo presión.",
      ogDescription: "Tetrominós, líneas, hold, vista previa y presión creciente en una versión online del clásico puzzle de acción.",
    },
  },
  articles: {
    pt: {
      title: "Puzzled | Artigos | Histórias de jogos e tutoriais",
      description:
        "Leia artigos do Puzzled sobre a história do Sudoku, Snake, Racha Cuca e Tetris, além de tutoriais de sudoku do básico ao X-Wing, X-Y-Wing e Swordfish.",
      ogTitle: "Puzzled | Artigos",
      ogDescription: "Histórias de jogos clássicos e guias e estratégias.",
    },
    en: {
      title: "Puzzled | Articles | Game stories and tutorials",
      description:
        "Read Puzzled articles about the history of Sudoku, Snake, the sliding puzzle and Tetris, plus sudoku tutorials from the basics to X-Wing, XY-Wing and Swordfish.",
      ogTitle: "Puzzled | Articles",
      ogDescription: "Stories of classic games, guides and strategies.",
    },
    es: {
      title: "Puzzled | Artículos | Historias de juegos y tutoriales",
      description:
        "Lee artículos de Puzzled sobre la historia del Sudoku, Snake, el rompecabezas deslizante y Tetris, además de tutoriales de sudoku desde lo básico hasta X-Wing, XY-Wing y Swordfish.",
      ogTitle: "Puzzled | Artículos",
      ogDescription: "Historias de juegos clásicos, guías y estrategias.",
    },
  },
  about: {
    pt: {
      title: "Sobre o Puzzled | Jogos online, lógica e estratégia",
      description:
        "Conheça o Puzzled: um site com Sudoku, Snake, Racha Cuca, Tetris, artigos sobre jogos clássicos e tutoriais de sudoku para iniciantes e jogadores avançados.",
      ogTitle: "Sobre o Puzzled",
      ogDescription: "Jogos online e artigos para quem gosta de resolver problemas, reconhecer padrões e aprender estratégias.",
    },
    en: {
      title: "About Puzzled | Online games, logic and strategy",
      description:
        "Meet Puzzled: a site with Sudoku, Snake, the sliding puzzle, Tetris, articles about classic games and sudoku tutorials for beginners and advanced players.",
      ogTitle: "About Puzzled",
      ogDescription: "Online games and articles for people who enjoy solving problems, spotting patterns and learning strategies.",
    },
    es: {
      title: "Acerca de Puzzled | Juegos online, lógica y estrategia",
      description:
        "Conoce Puzzled: un sitio con Sudoku, Snake, rompecabezas deslizante, Tetris, artículos sobre juegos clásicos y tutoriales de sudoku para principiantes y jugadores avanzados.",
      ogTitle: "Acerca de Puzzled",
      ogDescription: "Juegos online y artículos para quien disfruta resolver problemas, reconocer patrones y aprender estrategias.",
    },
  },
  contact: {
    pt: {
      title: "Contato | Puzzled",
      description:
        "Entre em contato com o Puzzled para enviar dúvidas, relatar problemas, sugerir artigos ou tratar de assuntos relacionados ao site.",
    },
    en: {
      title: "Contact | Puzzled",
      description: "Get in touch with Puzzled to ask questions, report problems, suggest articles or discuss anything related to the site.",
    },
    es: {
      title: "Contacto | Puzzled",
      description: "Ponte en contacto con Puzzled para enviar dudas, reportar problemas, sugerir artículos o tratar asuntos relacionados con el sitio.",
    },
  },
  privacy: {
    pt: {
      title: "Privacidade | Puzzled",
      description:
        "Entenda como o Puzzled usa armazenamento local do navegador para idioma, progresso, configurações e recordes dos jogos.",
    },
    en: {
      title: "Privacy | Puzzled",
      description: "Learn how Puzzled uses your browser's local storage for language, progress, settings and game records.",
    },
    es: {
      title: "Privacidad | Puzzled",
      description: "Entiende cómo Puzzled usa el almacenamiento local del navegador para idioma, progreso, configuración y récords de los juegos.",
    },
  },
};

/** Palavras-chave em português (as páginas já existiam assim). */
const ptKeywords: Partial<Record<PageKey, string[]>> = {
  home: ["Puzzled", "jogos online", "sudoku online", "snake online", "racha cuca", "slide puzzle", "tetris", "tutoriais de sudoku"],
  sudoku: ["sudoku", "free sudoku online", "math game", "numbers game", "organize os números", "técnicas de sudoku"],
  snake: ["play snake", "jogo da cobra", "jogo da cobrinha", "serpente", "jogue snake gratis", "snake online gratis"],
  slide: ["Racha Cuca", "puzzle", "slide", "numbers game", "organize os números", "quebra-cabeça deslizante"],
  tetris: ["tetris online", "jogar tetris", "tetrominos", "puzzle de ação", "jogos clássicos"],
  about: ["sobre o Puzzled", "jogos de lógica", "jogos clássicos", "sudoku", "snake", "racha cuca", "tutoriais de sudoku", "estratégia"],
};

export function getPageText(page: PageKey, language: Language) {
  return pageText[page][language];
}

/** hreflang: a mesma página em cada idioma, mais o x-default em português. */
export function languageAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[htmlLang[locale]] = absoluteUrl(path, locale);
  }
  languages["x-default"] = absoluteUrl(path, "pt");
  return languages;
}

export function buildPageMetadata(page: PageKey, language: Language): Metadata {
  const text = pageText[page][language];
  const path = pagePaths[page];
  const url = absoluteUrl(path, language);
  return {
    title: text.title,
    description: text.description,
    keywords: language === "pt" ? ptKeywords[page] : undefined,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      title: text.ogTitle ?? text.title,
      description: text.ogDescription ?? text.description,
      url,
      siteName: "Puzzled",
      locale: ogLocale[language],
      type: "website",
    },
  };
}

/** Metadata comum a todas as páginas de um idioma (definida no layout raiz). */
export function buildBaseMetadata(language: Language): Metadata {
  const home = pageText.home[language];
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: home.ogTitle ?? home.title, template: "%s" },
    description: home.description,
    applicationName: "Puzzled",
    authors: [{ name: "Puzzled" }],
    creator: "Puzzled",
    publisher: "Puzzled",
    openGraph: {
      title: home.ogTitle ?? home.title,
      description: home.ogDescription ?? home.description,
      url: absoluteUrl("/", language),
      siteName: "Puzzled",
      locale: ogLocale[language],
      type: "website",
      images: [{ url: `${SITE_URL}/icon.jpeg`, width: 1200, height: 1200 }],
    },
    twitter: {
      card: "summary_large_image",
      title: home.ogTitle ?? home.title,
      description: home.ogDescription ?? home.description,
      images: [`${SITE_URL}/icon.jpeg`],
    },
  };
}
