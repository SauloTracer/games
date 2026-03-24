import type { MathWizRun, MathWizSettings } from "@/components/mathwiz/game/types";

const SETTINGS_KEY = "mathwiz-settings";
const BEST_RUN_KEY = "mathwiz-best-run";

export const defaultMathWizSettings: MathWizSettings = {
  animationsEnabled: true,
  showResultPreview: true,
};

export function loadMathWizSettings() {
  if (typeof window === "undefined") {
    return defaultMathWizSettings;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return defaultMathWizSettings;
    }

    return {
      ...defaultMathWizSettings,
      ...(JSON.parse(raw) as Partial<MathWizSettings>),
    };
  } catch {
    return defaultMathWizSettings;
  }
}

export function saveMathWizSettings(settings: MathWizSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadBestMathWizRun() {
  if (typeof window === "undefined") {
    return null as MathWizRun | null;
  }

  try {
    const raw = window.localStorage.getItem(BEST_RUN_KEY);
    return raw ? (JSON.parse(raw) as MathWizRun) : null;
  } catch {
    return null as MathWizRun | null;
  }
}

export function saveBestMathWizRun(run: MathWizRun) {
  if (typeof window === "undefined") {
    return;
  }

  const current = loadBestMathWizRun();
  const shouldReplace =
    !current ||
    run.level > current.level ||
    (run.level === current.level && run.stableSpells > current.stableSpells) ||
    (run.level === current.level && run.stableSpells === current.stableSpells && run.highestCombo > current.highestCombo);

  if (shouldReplace) {
    window.localStorage.setItem(BEST_RUN_KEY, JSON.stringify(run));
  }
}

