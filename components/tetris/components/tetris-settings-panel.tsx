"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/components/language-provider";
import type { TetrisSettings } from "@/components/tetris/game/types";

type TetrisSettingsPanelProps = {
  settings: TetrisSettings;
  onBack: () => void;
  onFieldChange: <K extends keyof TetrisSettings>(field: K, value: TetrisSettings[K]) => void;
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-ground p-5">
      <div className="mb-5">
        <h3 className="font-display text-xl font-extrabold text-ink">{title}</h3>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-ink">{label}</span>
        <span className="text-sm font-bold text-tetris-ink">
          {value}
          {suffix}
        </span>
      </div>
      <input className="accent-tetris" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-ink" />
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  disabled = false,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${disabled ? "border-line bg-chip opacity-60" : "border-line bg-surface"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-ink">{label}</span>
      </div>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          if (disabled) {
            return;
          }
          const parsed = Number(event.target.value);
          if (!Number.isFinite(parsed)) {
            return;
          }
          onChange(Math.min(max, Math.max(min, parsed)));
        }}
        className="w-20 min-h-11 rounded-xl border border-line-strong bg-surface px-3 py-2 font-semibold text-ink disabled:cursor-not-allowed disabled:bg-chip"
      />
    </label>
  );
}

export function TetrisSettingsPanel({ settings, onBack, onFieldChange }: TetrisSettingsPanelProps) {
  const { t } = useLanguage();

  return (
    <section className="w-full py-2">
      <div className="grid gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-ink">{t("tetris.game.settings")}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{t("tetris.settings.description")}</p>
          </div>

          <div className="grid shrink-0 gap-3 md:w-60">
            <div className="rounded-xl bg-chip p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">{t("tetris.settings.summaryTitle")}</p>
              <div className="mt-3 grid gap-2 text-sm text-ink">
                <p>{t("tetris.settings.summaryTheme").replace("{value}", settings.theme === "arcade-dark" ? t("tetris.settings.themeDark") : t("tetris.settings.themeLight"))}</p>
                <p>{t("tetris.settings.summaryHold").replace("{value}", settings.holdEnabled ? t("tetris.settings.enabled") : t("tetris.settings.disabled"))}</p>
                <p>{t("tetris.settings.summaryPreview").replace("{value}", settings.showNextQueue ? t("tetris.settings.previewVisible").replace("{count}", String(settings.previewCount)) : t("tetris.settings.previewHidden"))}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="min-h-11 rounded-xl border border-line-strong bg-surface px-5 py-2 font-semibold text-ink transition hover:bg-chip"
            >
              {t("tetris.settings.back")}
            </button>
          </div>
        </div>

        <div className="grid gap-5">
          <SectionCard title={t("tetris.settings.audioTitle")}>
            <div className="grid gap-4">
              <SliderField label={t("tetris.settings.masterVolume")} value={settings.masterVolume} min={0} max={100} step={1} onChange={(value) => onFieldChange("masterVolume", value)} />
              <SliderField label={t("tetris.settings.musicVolume")} value={settings.musicVolume} min={0} max={100} step={1} onChange={(value) => onFieldChange("musicVolume", value)} />
              <SliderField label={t("tetris.settings.effectsVolume")} value={settings.effectsVolume} min={0} max={100} step={1} onChange={(value) => onFieldChange("effectsVolume", value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleField label={t("tetris.settings.muteMusic")} checked={settings.muteMusic} onChange={(value) => onFieldChange("muteMusic", value)} />
              <ToggleField label={t("tetris.settings.muteEffects")} checked={settings.muteEffects} onChange={(value) => onFieldChange("muteEffects", value)} />
            </div>
          </SectionCard>

          <SectionCard title={t("tetris.settings.pacingTitle")}>
            <div className="grid gap-4 lg:grid-cols-2">
              <SliderField label={t("tetris.settings.initialSpeed")} value={settings.initialSpeed} min={220} max={900} step={10} suffix=" ms" onChange={(value) => onFieldChange("initialSpeed", value)} />
              <SliderField label={t("tetris.settings.initialLevel")} value={settings.initialLevel} min={0} max={10} step={1} onChange={(value) => onFieldChange("initialLevel", value)} />
            </div>
          </SectionCard>

          <SectionCard title={t("tetris.settings.gameplayTitle")}>
            <div className="grid gap-3 lg:grid-cols-2">
              <ToggleField label={t("tetris.settings.holdEnabled")} checked={settings.holdEnabled} onChange={(value) => onFieldChange("holdEnabled", value)} />
              <ToggleField label={t("tetris.settings.showNextQueue")} checked={settings.showNextQueue} onChange={(value) => onFieldChange("showNextQueue", value)} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <ToggleField label={t("tetris.settings.ghostPiece")} checked={settings.showGhostPiece} onChange={(value) => onFieldChange("showGhostPiece", value)} />
              <NumberField
                label={t("tetris.settings.previewCount")}
                value={settings.previewCount}
                min={1}
                max={3}
                disabled={!settings.showNextQueue}
                onChange={(value) => onFieldChange("previewCount", value as 1 | 2 | 3)}
              />
            </div>
          </SectionCard>

          <SectionCard title={t("tetris.settings.appearanceTitle")}>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onFieldChange("theme", "arcade-dark")}
                className={`min-h-11 rounded-xl px-5 py-2 font-semibold transition ${
                  settings.theme === "arcade-dark" ? "bg-ink text-white" : "border border-line-strong bg-surface text-ink"
                }`}
              >
                {t("tetris.settings.themeDark")}
              </button>
              <button
                type="button"
                onClick={() => onFieldChange("theme", "arcade-light")}
                className={`min-h-11 rounded-xl px-5 py-2 font-semibold transition ${
                  settings.theme === "arcade-light" ? "bg-tetris text-ink" : "border border-line-strong bg-surface text-ink"
                }`}
              >
                {t("tetris.settings.themeLight")}
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
