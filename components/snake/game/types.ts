export type SnakeDirection = "up" | "down" | "left" | "right";

export type WallMode = "wrap" | "collision";

export type SnakeScreen = "menu" | "settings" | "playing" | "paused" | "game-over";

export type FoodType = "common" | "rare" | "special";

export type SnakeSegment = {
  x: number;
  y: number;
};

export type SnakeFood = SnakeSegment & {
  type: FoodType;
};

export type SnakeSettings = {
  wallMode: WallMode;
  swipeSensitivity: number;
  initialSpeed: number;
  volume: number;
  muted: boolean;
};

export type SnakeSession = {
  snake: SnakeSegment[];
  direction: SnakeDirection;
  queuedDirection: SnakeDirection;
  food: SnakeFood;
  score: number;
  speedMs: number;
  over: boolean;
};

export type SnakeTickResult = {
  session: SnakeSession;
  ateFood: boolean;
  gameOver: boolean;
  gainedScore: number;
};
