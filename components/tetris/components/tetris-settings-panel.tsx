"use client";

import type { TetrisSettings } from "@/components/tetris/game/types";

type TetrisSettingsPanelProps = {
  settings: TetrisSettings;
  onBack: () => void;
  onFieldChange: <K extends keyof TetrisSettings>(field: K, value: TetrisSettings[K]) => void;
};

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

export function TetrisSettingsPanel({ settings, onBack, onFieldChange }: TetrisSettingsPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-panel backdrop-blur md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-700">Configuração</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-stone-900">Tetris</h1>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-700 transition hover:border-stone-500"
        >
          Voltar
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SliderField label="Volume geral" value={settings.masterVolume} min={0} max={100} step={1} onChange={(value) => onFieldChange("masterVolume", value)} />
        <SliderField label="Música" value={settings.musicVolume} min={0} max={100} step={1} onChange={(value) => onFieldChange("musicVolume", value)} />
        <SliderField label="Efeitos" value={settings.effectsVolume} min={0} max={100} step={1} onChange={(value) => onFieldChange("effectsVolume", value)} />
        <SliderField label="Velocidade inicial" value={settings.initialSpeed} min={220} max={900} step={10} suffix=" ms" onChange={(value) => onFieldChange("initialSpeed", value)} />
        <SliderField label="Nível inicial" value={settings.initialLevel} min={0} max={10} step={1} onChange={(value) => onFieldChange("initialLevel", value)} />

        <div className="grid gap-4 rounded-2xl border border-stone-200 bg-white/80 p-4">
          <p className="font-semibold text-stone-800">Tema visual</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onFieldChange("theme", "arcade-dark")}
              className={`rounded-full px-4 py-2 font-semibold transition ${
                settings.theme === "arcade-dark" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Escuro
            </button>
            <button
              type="button"
              onClick={() => onFieldChange("theme", "arcade-light")}
              className={`rounded-full px-4 py-2 font-semibold transition ${
                settings.theme === "arcade-light" ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-800"
              }`}
            >
              Claro
            </button>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-stone-200 bg-white/80 p-4">
          <label className="flex items-center justify-between gap-4">
            <span className="font-semibold text-stone-800">Ghost piece</span>
            <input
              type="checkbox"
              checked={settings.showGhostPiece}
              onChange={(event) => onFieldChange("showGhostPiece", event.target.checked)}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="font-semibold text-stone-800">Mutar música</span>
            <input type="checkbox" checked={settings.muteMusic} onChange={(event) => onFieldChange("muteMusic", event.target.checked)} className="h-5 w-5" />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="font-semibold text-stone-800">Mutar efeitos</span>
            <input type="checkbox" checked={settings.muteEffects} onChange={(event) => onFieldChange("muteEffects", event.target.checked)} className="h-5 w-5" />
          </label>
        </div>
      </div>
    </section>
  );
}

