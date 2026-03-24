"use client";

type SlideMenuProps = {
  title: string;
  subtitle: string;
  playLabel: string;
  settingsLabel: string;
  shareLabel: string;
  bestTimeLabel: string;
  bestMovesLabel: string;
  onPlay: () => void;
  onSettings: () => void;
  onShare: () => void;
};

export function SlideMenu({
  title,
  subtitle,
  playLabel,
  settingsLabel,
  shareLabel,
  bestTimeLabel,
  bestMovesLabel,
  onPlay,
  onSettings,
  onShare,
}: SlideMenuProps) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-panel backdrop-blur md:p-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mt-4 text-4xl font-black tracking-tight text-stone-900 md:text-6xl">{title}</h1>
        <p className="mt-4 whitespace-pre-line text-base leading-7 text-stone-600 md:text-lg">{subtitle}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-800">{bestTimeLabel}</span>
          <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">{bestMovesLabel}</span>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-xl gap-3">
        <button type="button" onClick={onPlay} className="rounded-2xl bg-rose-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-rose-700">
          {playLabel}
        </button>
        <button type="button" onClick={onSettings} className="rounded-2xl bg-stone-100 px-6 py-4 text-base font-semibold text-stone-700 transition hover:bg-stone-200">
          {settingsLabel}
        </button>
        <button type="button" onClick={onShare} className="rounded-2xl border border-stone-300 bg-white px-6 py-4 text-base font-semibold text-stone-700 transition hover:border-stone-400">
          {shareLabel}
        </button>
      </div>
    </section>
  );
}
