export type SlideScreen = "menu" | "settings" | "playing" | "victory";

export type SlideSettings = {
  boardSize: number;
  soundEnabled: boolean;
  animationsEnabled: boolean;
};

export type SlideRecord = {
  bestTimeSeconds: number | null;
  bestMoves: number | null;
};

export type SlideResult = {
  boardSize: number;
  elapsedSeconds: number;
  moves: number;
};
