"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AdCard } from "@/components/ad-card";
import { useLanguage } from "@/components/language-provider";
import { pickRandomAds } from "@/lib/ads";
import { getArticle } from "@/lib/articles";
import type { AdItem } from "@/lib/types";

/**
 * Peças compartilhadas do layout das páginas de jogo (Sudoku, Snake, Racha Cuca, Tetris).
 * Só cuidam de estrutura e estilo; a lógica de cada jogo continua no próprio componente.
 *
 * `ns` é o namespace de i18n do jogo ("sudoku", "snake", "slide", "tetris"); cada um tem
 * um objeto `layout` com os textos destas peças.
 */
export type GameNamespace = "sudoku" | "snake" | "slide" | "tetris";

const accentTag: Record<GameNamespace, string> = {
  sudoku: "bg-sudoku text-ink",
  snake: "bg-snake text-ink",
  slide: "bg-slide text-ink",
  tetris: "bg-tetris text-ink",
};

export function GamePage({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-col gap-7 pb-16 pt-2">{children}</div>;
}

/**
 * Renderiza modais/overlays de tela cheia direto no <body>, para que nenhum ancestral
 * (transform, filter, overflow...) os prenda dentro do contêiner do jogo.
 */
export function BodyPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}

export function GameHeader({ ns, title, children }: { ns: GameNamespace; title: string; children?: ReactNode }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <nav aria-label={t(`${ns}.layout.breadcrumb`)} className="text-[13px] text-subtle">
          <Link href="/#jogos" className="text-subtle underline-offset-2 hover:text-ink-soft hover:underline">
            {t(`${ns}.layout.games`)}
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{title}</span>
        </nav>
        <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-[-0.01em] text-ink md:text-[40px]">
          {title}
        </h1>
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

/** Seletor segmentado (ex.: Resposta/Candidatos no Sudoku). */
export function Segmented({
  label,
  options,
}: {
  label: string;
  options: { key: string; label: string; active: boolean; onClick: () => void }[];
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 rounded-xl border border-line bg-surface p-1">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          aria-pressed={option.active}
          onClick={option.onClick}
          className={`h-11 rounded-[9px] px-4 text-sm font-semibold transition ${
            option.active ? "bg-ink text-white" : "bg-transparent text-ink hover:bg-chip"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Etiqueta informativa na cor do jogo. */
export function GameTag({ ns, children, muted = false }: { ns: GameNamespace; children: ReactNode; muted?: boolean }) {
  const tone: Record<GameNamespace, string> = {
    sudoku: "bg-sudoku-soft text-sudoku-ink",
    snake: "bg-snake-soft text-snake-ink",
    slide: "bg-slide-soft text-slide-ink",
    tetris: "bg-tetris-soft text-tetris-ink",
  };
  return (
    <span
      className={`inline-flex h-9 items-center rounded-lg px-3 text-[13px] font-semibold ${
        muted ? "border border-line bg-surface text-muted" : tone[ns]
      }`}
    >
      {children}
    </span>
  );
}

export function GameBody({ board, panel }: { board: ReactNode; panel: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start gap-7">
      <div className="relative flex min-w-0 flex-[999_1_520px] justify-center rounded-[20px] border border-line bg-surface p-3 sm:p-6">
        {board}
      </div>
      <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">{panel}</aside>
    </div>
  );
}

export function PanelCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-[18px] rounded-[20px] border border-line bg-surface p-5 ${className}`}>{children}</div>
  );
}

export function PanelTitle({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">{children}</p>;
}

export function Stat({ label, value, align = "start" }: { label: string; value: ReactNode; align?: "start" | "end" }) {
  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${align === "end" ? "items-end text-right" : ""}`}>
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">{label}</span>
      <span className="font-display text-[30px] font-extrabold leading-tight tabular-nums text-ink">{value}</span>
    </div>
  );
}

export function StatRow({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-between gap-4">{children}</div>;
}

export function ActionGrid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const colClass = cols === 4 ? "grid-cols-4" : cols === 3 ? "grid-cols-3" : "grid-cols-2";
  return <div className={`grid ${colClass} gap-2`}>{children}</div>;
}

/** Botão de ação com ícone em cima e rótulo embaixo. */
export function ActionButton({
  icon,
  label,
  onClick,
  pressed,
  disabled = false,
  title,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  const active = pressed === true;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      disabled={disabled}
      title={title}
      className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-center text-xs font-semibold leading-tight transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-ink bg-ink text-white"
          : "border-line-strong bg-surface text-ink hover:border-ink/40 hover:bg-chip"
      }`}
    >
      <span aria-hidden="true" className="flex h-5 items-center">
        {icon}
      </span>
      {label}
    </button>
  );
}

/** Botão de ferramenta em linha (ícone + rótulo), para listas de ações secundárias. */
export function ToolButton({
  icon,
  label,
  onClick,
  pressed,
  disabled = false,
  title,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  const active = pressed === true;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      disabled={disabled}
      title={title}
      className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-[13px] font-semibold leading-tight transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-ink bg-ink text-white"
          : "border-line-strong bg-surface text-ink hover:border-ink/40 hover:bg-chip"
      }`}
    >
      <span aria-hidden="true" className="shrink-0">
        {icon}
      </span>
      <span className="min-w-0">{label}</span>
    </button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-12 w-full rounded-xl bg-ink px-4 text-[15px] font-bold text-white transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-[15px] font-semibold text-ink transition hover:bg-chip disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

/** Recomendação (afiliado) escolhida no cliente, depois do mount, para não divergir da hidratação. */
export function GameAd() {
  const [ad, setAd] = useState<AdItem | null>(null);

  useEffect(() => {
    setAd(pickRandomAds(1)[0] ?? null);
  }, []);

  if (!ad) {
    return null;
  }

  return <AdCard ad={ad} />;
}

export function KeyChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-chip px-2.5 py-1 text-[13px] font-bold text-ink">
      {children}
    </span>
  );
}

/** Linha de "Como jogar": chips de teclas + texto explicativo. */
export function HowToRow({ keys, text }: { keys?: ReactNode; text: string }) {
  return (
    <div className="flex flex-col gap-2">
      {keys ? <div className="flex flex-wrap items-center gap-1.5">{keys}</div> : null}
      <p className="text-[15px] leading-relaxed text-muted">{text}</p>
    </div>
  );
}

export function GameFooter({
  ns,
  articleSlug,
  children,
}: {
  ns: GameNamespace;
  articleSlug: string;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  const article = getArticle(articleSlug);
  const minutes = article?.readingMinutes;

  return (
    <section className="flex flex-wrap items-start gap-5">
      <div className="flex min-w-0 flex-[2_1_480px] flex-col gap-4 rounded-[20px] border border-line bg-surface p-6">
        <h2 className="font-display text-[22px] font-extrabold text-ink">{t(`${ns}.layout.howToPlay`)}</h2>
        {children}
      </div>
      <Link
        href={`/articles/${articleSlug}`}
        className="group flex min-h-[200px] min-w-0 flex-[1_1_300px] flex-col justify-between gap-3 rounded-[20px] bg-ink p-6 text-white transition hover:bg-[#1c2c4f]"
      >
        <span className={`self-start rounded-md px-2.5 py-1 text-xs font-bold ${accentTag[ns]}`}>
          {t(`${ns}.layout.nextStep`)}
          {minutes ? ` · ${t(`${ns}.layout.minutes`).replace("{count}", String(minutes))}` : ""}
        </span>
        <span className="font-display text-[22px] font-extrabold leading-tight">{t(`${ns}.layout.nextStepTitle`)}</span>
        <span className="inline-flex items-center gap-1.5 font-bold">
          {t(`${ns}.layout.readArticle`)}
          <ArrowRight size={18} aria-hidden="true" className="transition group-hover:translate-x-0.5" />
        </span>
      </Link>
    </section>
  );
}
