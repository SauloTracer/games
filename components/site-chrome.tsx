"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AdColumn } from "@/components/ad-column";
import { MobileAdModal } from "@/components/mobile-ad-modal";

const links = [
  { href: "/", label: "Home" },
  { href: "/sudoku", label: "Sudoku" },
];

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="rounded-full border border-stone-300 bg-white p-2 text-stone-800 md:hidden"
            aria-label="Toggle navigation"
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
