"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Ellipsis, Globe, House, LayoutGrid, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLanguage, type Language } from "@/components/language-provider";
import { PuzzleLogo } from "@/components/puzzle-logo";
import { SiteFooter } from "@/components/site-footer";

const LANGUAGES: Language[] = ["pt", "en", "es"];

type GameId = "sudoku" | "snake" | "slide" | "tetris";
const GAMES: GameId[] = ["sudoku", "snake", "slide", "tetris"];

// Classes completas (o Tailwind precisa enxergar os nomes literalmente).
const GAME_ACTIVE: Record<GameId, string> = {
  sudoku: "bg-sudoku-soft text-sudoku-ink",
  snake: "bg-snake-soft text-snake-ink",
  slide: "bg-slide-soft text-slide-ink",
  tetris: "bg-tetris-soft text-tetris-ink",
};

const navLinkBase =
  "inline-flex min-h-[44px] items-center rounded-[10px] px-3.5 text-[15px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

function isUnder(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function currentGame(pathname: string): GameId | null {
  return GAMES.find((game) => isUnder(pathname, `/${game}`)) ?? null;
}

function LanguageSelect({ id }: { id: string }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <span className="relative inline-flex">
      <Globe
        aria-hidden="true"
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink"
      />
      <select
        id={id}
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        aria-label={`${t("chrome.language")}: ${t(`chrome.languageNames.${language}`)}`}
        className="h-11 cursor-pointer appearance-none rounded-[10px] border border-line-strong bg-surface pl-9 pr-3.5 text-sm font-semibold text-ink transition hover:border-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {LANGUAGES.map((code) => (
          <option key={code} value={code} title={t(`chrome.languageNames.${code}`)}>
            {t(`chrome.languageShort.${code}`)}
          </option>
        ))}
      </select>
    </span>
  );
}

function MoreSheet({ onClose }: { onClose: () => void }) {
  const { language, setLanguage, t } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const links = [
    { href: "/about", label: t("chrome.about") },
    { href: "/contact", label: t("chrome.contact") },
    { href: "/privacy", label: t("chrome.privacy") },
  ];

  return (
    <div className="fixed inset-0 z-[35] md:hidden">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-sheet-title"
        id="more-sheet"
        className="absolute inset-x-0 bottom-0 rounded-t-[20px] bg-surface px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-3 shadow-card"
      >
        <div className="flex items-center justify-between">
          <h2 id="more-sheet-title" className="font-display text-xl font-extrabold">
            {t("chrome.more")}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("chrome.close")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] text-ink hover:bg-chip"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label={t("chrome.more")} className="mt-2 flex flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex min-h-[48px] items-center border-b border-line text-base font-semibold text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-5">
          <p id="more-language" className="mb-2 flex items-center gap-2 text-sm font-semibold text-subtle">
            <Globe size={16} aria-hidden="true" />
            {t("chrome.language")}
          </p>
          <div role="group" aria-labelledby="more-language" className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((code) => {
              const active = language === code;
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setLanguage(code)}
                  className={`min-h-[44px] rounded-xl border text-sm font-semibold transition ${
                    active ? "border-ink bg-ink text-white" : "border-line-strong bg-surface text-ink"
                  }`}
                >
                  {t(`chrome.languageNames.${code}`)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [moreOpen, setMoreOpen] = useState(false);
  const { t } = useLanguage();
  const game = currentGame(pathname);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const mainLinks = [
    { href: "/#jogos", label: t("chrome.games"), active: pathname === "/" },
    { href: "/articles", label: t("chrome.articles"), active: isUnder(pathname, "/articles") },
    { href: "/about", label: t("chrome.about"), active: isUnder(pathname, "/about") },
  ];

  const tabs = [
    { key: "home", href: "/", label: t("chrome.home"), icon: House, active: pathname === "/" },
    { key: "games", href: "/#jogos", label: t("chrome.games"), icon: LayoutGrid, active: game !== null },
    {
      key: "articles",
      href: "/articles",
      label: t("chrome.articles"),
      icon: BookOpen,
      active: isUnder(pathname, "/articles"),
    },
  ];
  const moreActive =
    moreOpen || ["/about", "/contact", "/privacy"].some((href) => isUnder(pathname, href));

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center gap-6 px-4 md:h-[72px] md:px-6">
          <Link
            href="/"
            aria-label={t("chrome.homeLink")}
            className="flex items-center gap-2.5 rounded-lg text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            <PuzzleLogo size={28} />
            <span className="font-display text-[22px] font-extrabold tracking-[0.02em] md:text-2xl">PUZZLED</span>
          </Link>

          {game ? (
            <nav aria-label={t("chrome.gamesNav")} className="hidden flex-1 items-center gap-1 md:flex">
              {GAMES.map((id) => {
                const active = id === game;
                return (
                  <Link
                    key={id}
                    href={`/${id}`}
                    aria-current={active ? "page" : undefined}
                    className={`${navLinkBase} ${active ? `${GAME_ACTIVE[id]} font-bold` : "text-muted hover:bg-chip hover:text-ink"}`}
                  >
                    {t(`chrome.${id}`)}
                  </Link>
                );
              })}
              <Link href="/articles" className={`${navLinkBase} text-muted hover:bg-chip hover:text-ink`}>
                {t("chrome.articles")}
              </Link>
            </nav>
          ) : (
            <nav aria-label={t("chrome.mainNav")} className="hidden flex-1 items-center gap-1 md:flex">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={link.active && link.href !== "/#jogos" ? "page" : undefined}
                  className={`${navLinkBase} ${link.active ? "bg-chip text-ink" : "text-muted hover:bg-chip hover:text-ink"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-2.5">
            <LanguageSelect id="language" />
            {game !== "sudoku" ? (
              <Link
                href="/sudoku"
                className="hidden h-11 items-center rounded-[10px] bg-ink px-[18px] text-[15px] font-bold text-white transition hover:bg-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:inline-flex"
              >
                {t("chrome.dailyChallenge")}
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <div className="pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0">
        <main className="mx-auto min-h-[calc(100vh-60px)] w-full max-w-[1200px] px-4 py-6 md:min-h-[calc(100vh-72px)] md:px-6 md:py-8">
          {children}
        </main>
        <SiteFooter />
      </div>

      {moreOpen ? <MoreSheet onClose={() => setMoreOpen(false)} /> : null}

      <nav
        aria-label={t("chrome.bottomNav")}
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-surface px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {tabs.map(({ key, href, label, icon: Icon, active }) => (
          <Link
            key={key}
            href={href}
            onClick={() => setMoreOpen(false)}
            aria-current={active && key !== "games" ? "page" : undefined}
            className={`flex h-[76px] flex-col items-center justify-center gap-1 text-xs ${
              active && !moreOpen ? "font-bold text-ink" : "font-semibold text-subtle"
            }`}
          >
            <Icon size={22} aria-hidden="true" strokeWidth={active && !moreOpen ? 2.4 : 2} />
            {label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen((value) => !value)}
          aria-expanded={moreOpen}
          aria-controls="more-sheet"
          className={`flex h-[76px] flex-col items-center justify-center gap-1 text-xs ${
            moreActive ? "font-bold text-ink" : "font-semibold text-subtle"
          }`}
        >
          <Ellipsis size={22} aria-hidden="true" strokeWidth={moreActive ? 2.4 : 2} />
          {t("chrome.more")}
        </button>
      </nav>
    </>
  );
}
