"use client";

type SlideHudProps = {
  timeLabel: string;
  movesLabel: string;
  restartLabel: string;
  onRestart: () => void;
};

export function SlideHud({ timeLabel, movesLabel, restartLabel, onRestart }: SlideHudProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-stone-200 bg-white/85 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-800">{timeLabel}</span>
        <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">{movesLabel}</span>
      </div>
      <button type="button" onClick={onRestart} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
        {restartLabel}
      </button>
    </div>
  );
}
