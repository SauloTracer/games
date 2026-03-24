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
    <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/85 p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-2xl font-black tracking-tight text-stone-900">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{description}</p> : null}
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
    <label className="grid gap-2 rounded-2xl border border-stone-200 bg-white/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-stone-800">{label}</span>
        <span className="text-sm font-bold text-cyan-700">
          {value}
          {suffix}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
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
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white/80 p-4">
      <span className="text-sm font-semibold text-stone-800">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5" />
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
    <label className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${disabled ? "border-stone-200/70 bg-stone-100/80 opacity-60" : "border-stone-200 bg-white/80"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-stone-800">{label}</span>
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
        className="w-20 rounded-xl border border-stone-300 bg-white px-3 py-2 font-semibold text-stone-900 disabled:cursor-not-allowed disabled:bg-stone-100"
      />
    </label>
  );
}

export function TetrisSettingsPanel({ settings, onBack, onFieldChange }: TetrisSettingsPanelProps) {
  const { t } = useLanguage();

  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-panel backdrop-blur md:p-8">
      <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="flex h-full flex-col justify-between rounded-[1.75rem] border border-cyan-200/70 bg-[radial-gradient(circle_at_top,#ecfeff_0%,#f8fafc_55%,#eef2ff_100%)] p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-700">{t("tetris.settings.kicker")}</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-stone-900">{t("tetris.title")}</h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">{t("tetris.settings.description")}</p>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border border-white/70 bg-white/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">{t("tetris.settings.summaryTitle")}</p>
              <div className="mt-3 grid gap-2 text-sm text-stone-700">
                <p>{t("tetris.settings.summaryTheme").replace("{value}", settings.theme === "arcade-dark" ? t("tetris.settings.themeDark") : t("tetris.settings.themeLight"))}</p>
                <p>{t("tetris.settings.summaryHold").replace("{value}", settings.holdEnabled ? t("tetris.settings.enabled") : t("tetris.settings.disabled"))}</p>
                <p>{t("tetris.settings.summaryPreview").replace("{value}", settings.showNextQueue ? t("tetris.settings.previewVisible").replace("{count}", String(settings.previewCount)) : t("tetris.settings.previewHidden"))}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-700 transition hover:border-stone-500"
            >
              {t("tetris.settings.back")}
            </button>
          </div>
        </aside>

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
                className={`rounded-full px-5 py-3 font-semibold transition ${
                  settings.theme === "arcade-dark" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {t("tetris.settings.themeDark")}
              </button>
              <button
                type="button"
                onClick={() => onFieldChange("theme", "arcade-light")}
                className={`rounded-full px-5 py-3 font-semibold transition ${
                  settings.theme === "arcade-light" ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-800"
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
