import { SlideGame } from "@/components/slide/slide-game";
import { GameJsonLd } from "@/components/pages/shared";
import type { Language } from "@/lib/i18n";

export function SlideBody({ language }: { language: Language }) {
  return (
    <>
      <SlideGame />
      <GameJsonLd game="slide" language={language} />
    </>
  );
}
