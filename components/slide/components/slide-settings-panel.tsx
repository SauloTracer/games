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
    <section className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-panel backdrop-blur md:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-black tracking-tight text-stone-900">{title}</h2>
        <button type="button" onClick={onBack} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700">
          {backLabel}
        </button>
      </div>

      <div className="mt-8 grid gap-6">
        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
          <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-stone-500" htmlFor="slide-board-size">
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
            className="mt-4 w-full accent-rose-600"
          />
        </div>

        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
          <label className="flex items-center gap-3 text-sm font-semibold text-stone-700">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(event) => onFieldChange("soundEnabled", event.target.checked)}
            />
            {soundLabel}
          </label>
          <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-stone-700">
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
