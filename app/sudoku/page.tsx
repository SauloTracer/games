import { SudokuGame } from "@/components/sudoku-game";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sudoku online grátis | Puzzled",
  description:
    "Jogue Sudoku online grátis com candidatos, marcações, impressão, compartilhamento e filtros para padrões como X-Wing e Swordfish.",
  keywords: [
    "sudoku",
    "free sudoku online",
    "math game",
    "numbers game",
    "organize os números",
    "técnicas de sudoku",
  ],
  alternates: {
    canonical: "https://puzzled.com.br/sudoku",
  },
  openGraph: {
    title: "Sudoku online grátis | Puzzled",
    description: "Um tabuleiro de Sudoku online com candidatos, marcações, impressão e ferramentas de estudo.",
    url: "https://puzzled.com.br/sudoku",
    siteName: "Puzzled",
    locale: "pt_BR",
    type: "website",
  },
};

export default function SudokuPage() {
  return <>
    <SudokuGame />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Game",
          name: "Sudoku",
          description: metadata.description,
          applicationCategory: "Game",
          operatingSystem: "All",
        }),
      }}
    />
  </>;
}
