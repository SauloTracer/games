import { SnakeGame } from "@/components/snake/snake-game";
import { GameJsonLd } from "@/components/pages/shared";
import type { Language } from "@/lib/i18n";

export function SnakeBody({ language }: { language: Language }) {
  return (
    <>
      <SnakeGame />
      <GameJsonLd game="snake" language={language} />
    </>
  );
}
