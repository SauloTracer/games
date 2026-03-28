import { SlideGame } from "@/components/slide/slide-game";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racha Cuca | Puzzled",
  description:
    "Jogue Racha Cuca online grátis. Mantenha seu cérebro ativo! Deslize os números para a posição correta no menor tempo possível para ganhar!",
  keywords: [
    "Racha Cuca",
    "puzzle",
    "slide",
    "numbers game",
    "organize os números"
  ],
};

export default function SlidePage() {
  return <>
    <SlideGame />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Game",
          name: "Racha Cuca | Slide Puzzle",
          description: "Jogue Racha Cuca Online Grátis | Play Slide Puzzle online for free",
          applicationCategory: "Game",
          operatingSystem: "All",
        }),
      }}
    />
  </>;
}
