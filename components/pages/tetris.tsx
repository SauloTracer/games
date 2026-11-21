import { TetrisGame } from "@/components/tetris/tetris-game";
import { GameJsonLd } from "@/components/pages/shared";
import type { Language } from "@/lib/i18n";

export function TetrisBody({ language }: { language: Language }) {
  return (
    <>
      <TetrisGame />
      <GameJsonLd game="tetris" language={language} />
    </>
  );
}
