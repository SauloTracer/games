import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "@/components/language-provider";
import { SiteChrome } from "@/components/site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://puzzled.com.br"),
  title: {
    default: "Puzzled | Jogos online de lógica",
    template: "%s",
  },
  description: "Jogos online de lógica, artigos sobre clássicos e tutoriais de Sudoku em português.",
  applicationName: "Puzzled",
  authors: [{ name: "Puzzled" }],
  creator: "Puzzled",
  publisher: "Puzzled",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Puzzled | Jogos clássicos online",
    description: "Jogue Sudoku, Snake, Racha Cuca e outros, ou leia nossos artigos para saber mais sobre jogos, estratégias e mais",
    url: "https://puzzled.com.br",
    siteName: "Puzzled",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://puzzled.com.br/icon.jpeg",
        width: 1200,
        height: 1200,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Puzzled | Jogos online de lógica",
    description: "Jogos clássicos, Sudoku online e guias de estratégia.",
    images: ["https://puzzled.com.br/icon.jpeg"]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <SiteChrome>{children}</SiteChrome>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
