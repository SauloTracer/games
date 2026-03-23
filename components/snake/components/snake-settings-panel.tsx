"use client";

import type { SnakeSettings, WallMode } from "@/components/snake/game/types";

type SnakeSettingsPanelProps = {
  title: string;
  backLabel: string;
  wallModeLabel: string;
  wrapLabel: string;
  wrapTitle: string;
  collisionLabel: string;
  swipeLabel: string;
  speedLabel: string;
  volumeLabel: string;
  muteLabel: string;
  settings: SnakeSettings;
  onBack: () => void;
  onWallModeChange: (wallMode: WallMode) => void;
  onFieldChange: <K extends keyof SnakeSettings>(field: K, value: SnakeSettings[K]) => void;
};

export function SnakeSettingsPanel({
  title,
  backLabel,
  wallModeLabel,
  wrapLabel,
  wrapTitle,
  collisionLabel,
  swipeLabel,
  speedLabel,
  volumeLabel,
  muteLabel,
  settings,
  onBack,
  onWallModeChange,
  onFieldChange,
}: SnakeSettingsPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-panel backdrop-blur md:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-black tracking-tight text-stone-900">{title}</h2>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700"
        >
          {backLabel}
        </button>
      </div>

      <div className="mt-8 grid gap-6">
        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">{wallModeLabel}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onWallModeChange("wrap")}
              title={wrapTitle}
              className={`rounded-2xl px-4 py-3 font-semibold ${settings.wallMode === "wrap" ? "bg-emerald-600 text-white" : "bg-white text-stone-700"}`}
            >
              {wrapLabel}
            </button>
            <button
              type="button"
              onClick={() => onWallModeChange("collision")}
              className={`rounded-2xl px-4 py-3 font-semibold ${settings.wallMode === "collision" ? "bg-emerald-600 text-white" : "bg-white text-stone-700"}`}
            >
              {collisionLabel}
            </button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
          <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-stone-500" htmlFor="snake-volume">
            {volumeLabel}: {settings.volume}%
          </label>
          <input
            id="snake-volume"
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={(event) => onFieldChange("volume", Number(event.target.value))}
            className="mt-4 w-full accent-emerald-600"
          />
          <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-stone-700">
            <input
              type="checkbox"
              checked={settings.muted}
              onChange={(event) => onFieldChange("muted", event.target.checked)}
            />
            {muteLabel}
          </label>
        </div>

        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
          <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-stone-500" htmlFor="snake-swipe">
            {swipeLabel}: {settings.swipeSensitivity}px
          </label>
          <input
            id="snake-swipe"
            type="range"
            min={16}
            max={96}
            step={2}
            value={settings.swipeSensitivity}
            onChange={(event) => onFieldChange("swipeSensitivity", Number(event.target.value))}
            className="mt-4 w-full accent-emerald-600"
          />
        </div>

        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
          <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-stone-500" htmlFor="snake-speed">
            {speedLabel}: {settings.initialSpeed}ms
          </label>
          <input
            id="snake-speed"
            type="range"
            min={90}
            max={260}
            step={5}
            value={settings.initialSpeed}
            onChange={(event) => onFieldChange("initialSpeed", Number(event.target.value))}
            className="mt-4 w-full accent-emerald-600"
          />
        </div>
      </div>
    </section>
  );
}
