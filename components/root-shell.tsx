import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { LanguageProvider } from "@/components/language-provider";
import { SiteChrome } from "@/components/site-chrome";
import { htmlLang, type Language } from "@/lib/i18n";
import "@/app/globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "800"],
  display: "swap",
  variable: "--font-display",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

/**
 * Estrutura raiz (<html>/<body>) compartilhada pelos layouts de cada idioma.
 * O português usa app/(pt)/layout.tsx e inglês/espanhol usam app/(intl)/[lang]/layout.tsx;
 * cada um é um layout raiz próprio para o <html lang> já sair certo do servidor.
 */
export function RootShell({ language, children }: { language: Language; children: ReactNode }) {
  return (
    <html lang={htmlLang[language]} className={`${display.variable} ${sans.variable}`}>
      <body className="bg-ground font-sans text-ink antialiased">
        <LanguageProvider language={language}>
          <SiteChrome>{children}</SiteChrome>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
