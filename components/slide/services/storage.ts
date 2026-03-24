import type { SlideRecord, SlideResult, SlideSettings } from "@/components/slide/game/types";

const SETTINGS_KEY = "slide-settings";
const RECORDS_KEY = "slide-records";
const LAST_RESULT_KEY = "slide-last-result";

export const defaultSlideSettings: SlideSettings = {
  boardSize: 4,
  soundEnabled: true,
  animationsEnabled: true,
};

export function loadSlideSettings() {
  if (typeof window === "undefined") {
    return defaultSlideSettings;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return defaultSlideSettings;
    }
    return {
      ...defaultSlideSettings,
      ...(JSON.parse(raw) as Partial<SlideSettings>),
    };
  } catch {
    return defaultSlideSettings;
  }
}

export function saveSlideSettings(settings: SlideSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSlideRecords() {
  if (typeof window === "undefined") {
    return {} as Record<string, SlideRecord>;
  }

  try {
    const raw = window.localStorage.getItem(RECORDS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SlideRecord>) : {};
  } catch {
    return {} as Record<string, SlideRecord>;
  }
}

export function saveSlideRecords(records: Record<string, SlideRecord>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function loadLastSlideResult() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LAST_RESULT_KEY);
    return raw ? (JSON.parse(raw) as SlideResult) : null;
  } catch {
    return null;
  }
}

export function saveLastSlideResult(result: SlideResult) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
}
