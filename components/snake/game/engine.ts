import type {
  FoodType,
  SnakeDirection,
  SnakeFood,
  SnakeSegment,
  SnakeSession,
  SnakeSettings,
  SnakeTickResult,
} from "@/components/snake/game/types";

export const SNAKE_GRID_SIZE = 24;
const MIN_SPEED_MS = 60;
const SPEED_STEP_MS = 6;
const START_LENGTH = 4;

const FOOD_POINTS: Record<FoodType, number> = {
  common: 10,
  rare: 25,
  special: 50,
};

export function getFoodPoints(type: FoodType) {
  return FOOD_POINTS[type];
}

export function isOppositeDirection(current: SnakeDirection, next: SnakeDirection) {
  return (
    (current === "up" && next === "down") ||
    (current === "down" && next === "up") ||
    (current === "left" && next === "right") ||
    (current === "right" && next === "left")
  );
}

function randomFoodType() {
  const roll = Math.random();
  if (roll < 0.72) {
    return "common" satisfies FoodType;
  }
  if (roll < 0.92) {
    return "rare" satisfies FoodType;
  }
  return "special" satisfies FoodType;
}

function sameCell(left: SnakeSegment, right: SnakeSegment) {
  return left.x === right.x && left.y === right.y;
}

export function createInitialSnake(gridSize = SNAKE_GRID_SIZE) {
  const center = Math.floor(gridSize / 2);
  return Array.from({ length: START_LENGTH }, (_, index) => ({
    x: center - index,
    y: center,
  }));
}

export function spawnFood(snake: SnakeSegment[], gridSize = SNAKE_GRID_SIZE): SnakeFood {
  const occupied = new Set(snake.map((segment) => `${segment.x}-${segment.y}`));
  const freeCells: SnakeSegment[] = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x}-${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  const pick = freeCells[Math.floor(Math.random() * freeCells.length)] ?? { x: 0, y: 0 };
  return { ...pick, type: randomFoodType() };
}

function moveHead(head: SnakeSegment, direction: SnakeDirection) {
  if (direction === "up") {
    return { x: head.x, y: head.y - 1 };
  }
  if (direction === "down") {
    return { x: head.x, y: head.y + 1 };
  }
  if (direction === "left") {
    return { x: head.x - 1, y: head.y };
  }
  return { x: head.x + 1, y: head.y };
}

function wrapPosition(segment: SnakeSegment, gridSize: number) {
  return {
    x: (segment.x + gridSize) % gridSize,
    y: (segment.y + gridSize) % gridSize,
  };
}

function computeSpeedMs(settings: SnakeSettings, score: number, snakeLength: number) {
  const reduction = Math.floor(score / 25) + Math.max(0, snakeLength - START_LENGTH);
  return Math.max(MIN_SPEED_MS, settings.initialSpeed - reduction * SPEED_STEP_MS);
}

export function createInitialSession(settings: SnakeSettings, gridSize = SNAKE_GRID_SIZE): SnakeSession {
  const snake = createInitialSnake(gridSize);
  return {
    snake,
    direction: "right",
    queuedDirection: "right",
    food: spawnFood(snake, gridSize),
    score: 0,
    speedMs: settings.initialSpeed,
    over: false,
  };
}

export function queueDirection(session: SnakeSession, nextDirection: SnakeDirection) {
  if (isOppositeDirection(session.direction, nextDirection)) {
    return session;
  }

  return {
    ...session,
    queuedDirection: nextDirection,
  };
}

export function tickSnake(session: SnakeSession, settings: SnakeSettings, gridSize = SNAKE_GRID_SIZE): SnakeTickResult {
  const direction = isOppositeDirection(session.direction, session.queuedDirection)
    ? session.direction
    : session.queuedDirection;
  let nextHead = moveHead(session.snake[0], direction);

  if (settings.wallMode === "wrap") {
    nextHead = wrapPosition(nextHead, gridSize);
  } else if (nextHead.x < 0 || nextHead.x >= gridSize || nextHead.y < 0 || nextHead.y >= gridSize) {
    return {
      session: { ...session, direction, queuedDirection: direction, over: true },
      ateFood: false,
      gameOver: true,
      gainedScore: 0,
    };
  }

  const ateFood = sameCell(nextHead, session.food);
  const bodyToCheck = ateFood ? session.snake : session.snake.slice(0, -1);
  const hitSelf = bodyToCheck.some((segment) => sameCell(segment, nextHead));
  if (hitSelf) {
    return {
      session: { ...session, direction, queuedDirection: direction, over: true },
      ateFood: false,
      gameOver: true,
      gainedScore: 0,
    };
  }

  const gainedScore = ateFood ? getFoodPoints(session.food.type) : 0;
  const snake = ateFood ? [nextHead, ...session.snake] : [nextHead, ...session.snake.slice(0, -1)];
  const score = session.score + gainedScore;

  return {
    session: {
      snake,
      direction,
      queuedDirection: direction,
      food: ateFood ? spawnFood(snake, gridSize) : session.food,
      score,
      speedMs: computeSpeedMs(settings, score, snake.length),
      over: false,
    },
    ateFood,
    gameOver: false,
    gainedScore,
  };
}
