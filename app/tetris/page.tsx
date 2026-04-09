import type { Metadata } from "next";
import { TetrisGame } from "@/components/tetris/tetris-game";

export const metadata: Metadata = {
  title: "Tetris online | Puzzle de ação grátis | Puzzled",
  description:
    "Jogue Tetris online no navegador. Rotacione tetrominós, limpe linhas, use hold, acompanhe as próximas peças e treine decisões sob pressão.",
  keywords: [
    "tetris online",
    "jogar tetris",
    "tetrominos",
    "puzzle de ação",
    "jogos clássicos",
  ],
  alternates: {
    canonical: "https://puzzled.com.br/tetris",
  },
  openGraph: {
    title: "Tetris online | Puzzled",
    description: "Tetrominós, linhas, hold, preview e pressão progressiva em uma versão online do clássico puzzle de ação.",
    url: "https://puzzled.com.br/tetris",
    siteName: "Puzzled",
    locale: "pt_BR",
    type: "website",
  },
};

export default function TetrisPage() {
  return <>
    <TetrisGame />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Game",
          name: "Tetris",
          description: metadata.description,
          applicationCategory: "Game",
          operatingSystem: "All",
        }),
      }}
    />
  </>;
}
