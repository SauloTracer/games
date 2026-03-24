"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/components/language-provider";

function ControlKey({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <span
      className={`inline-flex h-9 items-center justify-center rounded-xl border border-stone-300 bg-white px-3 text-xs font-bold text-stone-700 shadow-sm ${wide ? "min-w-[4.5rem]" : "min-w-9"
        }`}
    >
      {children}
    </span>
  );
}

function ControlRow({ visual, text }: { visual: ReactNode; text: string }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-cyan-200/40 bg-white/10 p-3 md:grid-cols-[auto_1fr] md:items-center">
      <div className="flex flex-wrap items-center gap-2">{visual}</div>
      <p className="max-w-[36rem] whitespace-normal break-words text-sm leading-6 text-slate-200">{text}</p>
    </div>
  );
}

type TetrisMenuProps = {
  bestScore: number;
  onPlay: () => void;
  onSettings: () => void;
};

export function TetrisMenu({ bestScore, onPlay, onSettings }: TetrisMenuProps) {
  const { t } = useLanguage();
  const subtitleParagraphs = t("tetris.menu.subtitle").split("\n\n");

  return (
    <section className="overflow-hidden rounded-[2rem] border border-cyan-200/70 bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#0f172a_45%,#020617_100%)] p-6 text-white shadow-panel md:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">{t("tetris.title")}</h1>
          <div className="max-w-2xl space-y-4 text-base leading-7 text-slate-200 md:text-lg">
            {subtitleParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onPlay}
              className="rounded-full bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              {t("tetris.menu.play")}
            </button>
            <button
              type="button"
              onClick={onSettings}
              className="rounded-full border border-cyan-300/40 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/15"
            >
              {t("tetris.menu.settings")}
            </button>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-black/25 p-5 backdrop-blur">
          <div className="rounded-[1.25rem] border border-cyan-300/20 bg-cyan-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">{t("tetris.menu.bestScore")}</p>
            <p className="mt-2 text-4xl font-black">{bestScore}</p>
          </div>
          <div className="grid gap-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-bold text-white">{t("tetris.menu.controlsTitle")}</p>
              <div className="mt-3 grid gap-3">
                <ControlRow
                  visual={
                    <>
                      <div className="grid gap-1">
                        <div className="flex justify-center">
                          <ControlKey>↑</ControlKey>
                        </div>
                        <div className="flex gap-1">
                          <ControlKey>←</ControlKey>
                          <ControlKey>↓</ControlKey>
                          <ControlKey>→</ControlKey>
                        </div>
                        <div className="flex gap-1 justify-around">
                          <ControlKey>P</ControlKey>
                          <ControlKey>C</ControlKey>
                        </div>
                        <ControlKey wide>Space</ControlKey>
                      </div>
                    </>
                  }
                  text={t("tetris.help.desktop")}
                />
                <ControlRow
                  visual={
                    <div className="grid gap-1">
                      <ControlKey wide>Swipe</ControlKey>
                      <ControlKey>Tap</ControlKey>
                      <ControlKey wide>Pause</ControlKey>
                    </div>
                  }
                  text={t("tetris.help.mobile")}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-bold text-white">{t("tetris.menu.goalTitle")}</p>
              <p className="mt-2 leading-6">{t("tetris.menu.goalBody")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
