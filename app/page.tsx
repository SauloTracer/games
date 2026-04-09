import type { Metadata } from "next";
import { HomePageContent } from "@/components/home-page-content";
import { articles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Puzzled | Jogos online de lógica, sudoku e clássicos",
  description:
    "Jogue Sudoku, Snake, Racha Cuca e Tetris online. Leia guias de estratégia, aprenda técnicas de sudoku e descubra a história dos jogos clássicos.",
  keywords: [
    "Puzzled",
    "jogos online",
    "sudoku online",
    "snake online",
    "racha cuca",
    "slide puzzle",
    "tetris",
    "tutoriais de sudoku",
  ],
  alternates: {
    canonical: "https://puzzled.com.br",
  },
  openGraph: {
    title: "Puzzled | Jogos online de lógica",
    description: "Sudoku, Snake, Racha Cuca, Tetris e artigos para pensar melhor enquanto joga.",
    url: "https://puzzled.com.br",
    siteName: "Puzzled",
    locale: "pt_BR",
    type: "website",
  },
};

export default function HomePage() {
  return <HomePageContent articles={articles} />;
}
