"use client";

import type { SlideSettings } from "@/components/slide/game/types";

type SlideSettingsPanelProps = {
  title: string;
  backLabel: string;
  boardSizeLabel: string;
  soundLabel: string;
  animationsLabel: string;
  settings: SlideSettings;
  onBack: () => void;
  onFieldChange: <K extends keyof SlideSettings>(field: K, value: SlideSettings[K]) => void;
};

export function SlideSettingsPanel({
  title,
  backLabel,
  boardSizeLabel,
  soundLabel,
  animationsLabel,
  settings,
  onBack,
  onFieldChange,
}: SlideSettingsPanelProps) {
  return (
    <section className="w-full py-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-extrabold text-ink">{title}</h2>
        <button type="button" onClick={onBack} className="min-h-11 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold text-ink hover:bg-chip">
          {backLabel}
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="rounded-2xl border border-line bg-ground p-5">
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-subtle" htmlFor="slide-board-size">
            {boardSizeLabel}: {settings.boardSize}x{settings.boardSize}
          </label>
          <input
            id="slide-board-size"
            type="range"
            min={4}
            max={8}
            step={1}
            value={settings.boardSize}
            onChange={(event) => onFieldChange("boardSize", Number(event.target.value))}
            className="mt-4 w-full accent-slide"
          />
        </div>

        <div className="rounded-2xl border border-line bg-ground p-5">
          <label className="flex items-center gap-3 min-h-11 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(event) => onFieldChange("soundEnabled", event.target.checked)}
            />
            {soundLabel}
          </label>
          <label className="mt-4 flex items-center gap-3 min-h-11 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={settings.animationsEnabled}
              onChange={(event) => onFieldChange("animationsEnabled", event.target.checked)}
            />
            {animationsLabel}
          </label>
        </div>
      </div>
    </section>
  );
}
