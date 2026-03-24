import type { TetrisRankingEntry, TetrisSettings } from "@/components/tetris/game/types";

const SETTINGS_KEY = "tetris-settings";
const HIGH_SCORE_KEY = "tetris-high-score";
const RANKING_KEY = "tetris-ranking";

export const defaultTetrisSettings: TetrisSettings = {
  masterVolume: 80,
  musicVolume: 60,
  effectsVolume: 75,
  muteMusic: false,
  muteEffects: false,
  initialSpeed: 680,
  initialLevel: 0,
  theme: "arcade-dark",
  showGhostPiece: true,
};

export function loadTetrisSettings() {
  if (typeof window === "undefined") {
    return defaultTetrisSettings;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return defaultTetrisSettings;
    }
    return {
      ...defaultTetrisSettings,
      ...(JSON.parse(raw) as Partial<TetrisSettings>),
    };
  } catch {
    return defaultTetrisSettings;
  }
}

export function saveTetrisSettings(settings: TetrisSettings) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadTetrisHighScore() {
  if (typeof window === "undefined") {
    return 0;
  }
  const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function saveTetrisHighScore(score: number) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
}

export function loadTetrisRanking() {
  if (typeof window === "undefined") {
    return [] as TetrisRankingEntry[];
  }
  try {
    const raw = window.localStorage.getItem(RANKING_KEY);
    if (!raw) {
      return [] as TetrisRankingEntry[];
    }
    const parsed = JSON.parse(raw) as TetrisRankingEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as TetrisRankingEntry[];
  }
}

export function saveTetrisResult(entry: TetrisRankingEntry) {
  if (typeof window === "undefined") {
    return;
  }
  const ranking = loadTetrisRanking();
  const nextRanking = [...ranking, entry]
    .sort((left, right) => right.score - left.score || right.lines - left.lines || right.level - left.level)
    .slice(0, 5);
  window.localStorage.setItem(RANKING_KEY, JSON.stringify(nextRanking));
}

