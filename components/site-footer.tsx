"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { PuzzleLogo } from "@/components/puzzle-logo";

export function SiteFooter() {
  const { t } = useLanguage();

  const columns = [
    {
      title: t("chrome.games"),
      links: [
        { href: "/sudoku", label: t("chrome.sudoku") },
        { href: "/snake", label: t("chrome.snake") },
        { href: "/slide", label: t("chrome.slide") },
        { href: "/tetris", label: t("chrome.tetris") },
      ],
    },
    {
      title: "Puzzled",
      links: [
        { href: "/articles", label: t("chrome.articles") },
        { href: "/about", label: t("chrome.about") },
        { href: "/contact", label: t("chrome.contact") },
        { href: "/privacy", label: t("chrome.privacy") },
      ],
    },
  ];

  return (
    <footer className="bg-ink text-[#C9D1E3]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-8 px-6 py-12">
        <div className="flex max-w-xs flex-col gap-3">
          <Link href="/" className="flex items-center gap-2.5 text-white" aria-label={t("chrome.homeLink")}>
            <PuzzleLogo size={26} />
            <span className="font-display text-2xl font-extrabold tracking-[0.02em]">PUZZLED</span>
          </Link>
          <p className="text-sm leading-relaxed">{t("chrome.tagline")}</p>
        </div>

        <nav aria-label={t("chrome.footerNav")} className="flex flex-wrap gap-12 text-sm">
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-1">
              <span className="mb-1 font-bold text-white">{column.title}</span>
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="-mx-1 rounded px-1 py-1.5 text-[#C9D1E3] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
