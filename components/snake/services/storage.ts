import type { SnakeSettings } from "@/components/snake/game/types";

const SETTINGS_KEY = "snake-settings";
const BEST_SCORE_KEY = "snake-best-score";

export const defaultSnakeSettings: SnakeSettings = {
  wallMode: "wrap",
  swipeSensitivity: 36,
  initialSpeed: 170,
  volume: 70,
  muted: false,
};

export function loadSnakeSettings() {
  if (typeof window === "undefined") {
    return defaultSnakeSettings;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return defaultSnakeSettings;
    }

    const parsed = JSON.parse(raw) as Partial<SnakeSettings>;
    return {
      ...defaultSnakeSettings,
      ...parsed,
    };
  } catch {
    return defaultSnakeSettings;
  }
}

export function saveSnakeSettings(settings: SnakeSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadBestSnakeScore() {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = window.localStorage.getItem(BEST_SCORE_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function saveBestSnakeScore(score: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(BEST_SCORE_KEY, String(score));
}
