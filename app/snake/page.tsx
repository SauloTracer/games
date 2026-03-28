import { SnakeGame } from "@/components/snake/snake-game";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snake | Puzzled",
  description:
    "Jogue snake online grátis. Desafie seus reflexos e vá além dos seus limites! Cada movimento conta, cada ponto é uma conquista! Até onde você consegue chegar sem errar? Não deixe a cobra morrer de fome! 🐍🔥",
  keywords: [
    "play snake",
    "jogo da cobra",
    "jogo da cobrinha",
    "serpente",
    "jogue snake gratis"
  ],
};

export default function SnakePage() {
  return <>
    <SnakeGame />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Game",
          name: "Snake",
          description: "Jogue Snake Online Grátis | Play Snake online for free",
          applicationCategory: "Game",
          operatingSystem: "All",
        }),
      }}
    />
  </>;
}
