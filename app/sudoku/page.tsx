import { SudokuGame } from "@/components/sudoku-game";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sudoku | Puzzled",
  description:
    "Jogue sudoku online grátis. Mantenha seu cérebro ativo!",
  keywords: [
    "sudoku",
    "free sudoku online",
    "math game",
    "numbers game",
    "organize os números"
  ],
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
          description: "Jogue Sudoku Online Grátis | Play Sudoku online for free",
          applicationCategory: "Game",
          operatingSystem: "All",
        }),
      }}
    />
  </>;
}
