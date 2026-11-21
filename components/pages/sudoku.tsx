import { SudokuGame } from "@/components/sudoku-game";
import { GameJsonLd } from "@/components/pages/shared";
import type { Language } from "@/lib/i18n";

export function SudokuBody({ language }: { language: Language }) {
  return (
    <>
      <SudokuGame />
      <GameJsonLd game="sudoku" language={language} />
    </>
  );
}
