"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useLanguage } from "@/components/language-provider";
import { AdColumn } from "@/components/ad-column";
import { MobileAdModal } from "@/components/mobile-ad-modal";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const links = [
    { href: "/", label: t("chrome.home") },
    { href: "/sudoku", label: t("chrome.sudoku") },
    { href: "/snake", label: t("chrome.snake") },
    { href: "/slide", label: t("chrome.slide") },
    { href: "/tetris", label: t("chrome.tetris") },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <MobileAdModal />
      <header className="sticky top-0 z-40 border-b border-white/50 bg-[#fbf8f2]/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href="/" className="text-lg font-black uppercase tracking-[0.4em] text-stone-900">
            Puzzled
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? "bg-amber-600 text-white" : "text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <label htmlFor="language" className="text-sm font-semibold text-stone-600">
              {t("chrome.language")}
            </label>
            <select
              id="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as "en" | "pt" | "es")}
              className="rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700"
            >
              <option value="en">{t("chrome.languageNames.en")}</option>
              <option value="pt">{t("chrome.languageNames.pt")}</option>
              <option value="es">{t("chrome.languageNames.es")}</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="rounded-full border border-stone-300 bg-white p-2 text-stone-800 md:hidden"
            aria-label={t("chrome.toggleNavigation")}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-stone-200 bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                    pathname === link.href ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3">
              <label htmlFor="language-mobile" className="mb-2 block text-sm font-semibold text-stone-600">
                {t("chrome.language")}
              </label>
              <select
                id="language-mobile"
                value={language}
                onChange={(event) => setLanguage(event.target.value as "en" | "pt" | "es")}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700"
              >
                <option value="en">{t("chrome.languageNames.en")}</option>
                <option value="pt">{t("chrome.languageNames.pt")}</option>
                <option value="es">{t("chrome.languageNames.es")}</option>
              </select>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-[1700px] gap-6 px-4 py-6 md:px-6 md:py-8">
        <AdColumn />
        <div className="min-w-0 flex-1">{children}</div>
        <AdColumn />
      </main>
    </>
  );
}
