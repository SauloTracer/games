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
    <section className="w-full py-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-extrabold text-ink">{title}</h2>
        <button
          type="button"
          onClick={onBack}
          className="min-h-11 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold text-ink hover:bg-chip"
        >
          {backLabel}
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="rounded-2xl border border-line bg-ground p-5">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">{wallModeLabel}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onWallModeChange("wrap")}
              title={wrapTitle}
              className={`min-h-12 rounded-xl px-4 py-3 font-semibold ${settings.wallMode === "wrap" ? "bg-snake text-ink" : "border border-line-strong bg-surface text-ink"}`}
            >
              {wrapLabel}
            </button>
            <button
              type="button"
              onClick={() => onWallModeChange("collision")}
              className={`min-h-12 rounded-xl px-4 py-3 font-semibold ${settings.wallMode === "collision" ? "bg-snake text-ink" : "border border-line-strong bg-surface text-ink"}`}
            >
              {collisionLabel}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-ground p-5">
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-subtle" htmlFor="snake-volume">
            {volumeLabel}: {settings.volume}%
          </label>
          <input
            id="snake-volume"
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={(event) => onFieldChange("volume", Number(event.target.value))}
            className="mt-4 w-full accent-snake"
          />
          <label className="mt-4 flex items-center gap-3 min-h-11 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={settings.muted}
              onChange={(event) => onFieldChange("muted", event.target.checked)}
            />
            {muteLabel}
          </label>
        </div>

        <div className="rounded-2xl border border-line bg-ground p-5">
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-subtle" htmlFor="snake-swipe">
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
            className="mt-4 w-full accent-snake"
          />
        </div>

        <div className="rounded-2xl border border-line bg-ground p-5">
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-subtle" htmlFor="snake-speed">
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
            className="mt-4 w-full accent-snake"
          />
        </div>
      </div>
    </section>
  );
}
