"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SNAKE_GRID_SIZE,
  createInitialSession,
  isOppositeDirection,
  queueDirection,
  tickSnake,
} from "@/components/snake/game/engine";
import type { SnakeDirection, SnakeScreen, SnakeSession, SnakeSettings, WallMode } from "@/components/snake/game/types";
import { SnakeAudioController } from "@/components/snake/services/audio";
import {
  defaultSnakeSettings,
  loadBestSnakeScore,
  loadSnakeSettings,
  saveBestSnakeScore,
  saveSnakeSettings,
} from "@/components/snake/services/storage";

function directionFromDelta(deltaX: number, deltaY: number, threshold: number): SnakeDirection | null {
  if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
    return null;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? "right" : "left";
  }

  return deltaY > 0 ? "down" : "up";
}

export function useSnakeGame() {
  const [settings, setSettings] = useState<SnakeSettings>(defaultSnakeSettings);
  const [bestScore, setBestScore] = useState(0);
  const [screen, setScreen] = useState<SnakeScreen>("menu");
  const [session, setSession] = useState<SnakeSession>(() => createInitialSession(defaultSnakeSettings));
  const [statusMessage, setStatusMessage] = useState("");
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef(0);
  const audioRef = useRef<SnakeAudioController | null>(null);
  const boostActiveRef = useRef(false);

  useEffect(() => {
    audioRef.current = new SnakeAudioController();
    const loadedSettings = loadSnakeSettings();
    setSettings(loadedSettings);
    setSession(createInitialSession(loadedSettings));
    setBestScore(loadBestSnakeScore());
  }, []);

  useEffect(() => {
    audioRef.current?.updateSettings(settings);
    saveSnakeSettings(settings);
  }, [settings]);

  const stopLoop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    lastFrameTimeRef.current = null;
    accumulatorRef.current = 0;
  }, []);

  const handleGameOver = useCallback(
    (nextScore: number) => {
      stopLoop();
      boostActiveRef.current = false;
      audioRef.current?.playGameOver();
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(140);
      }

      setBestScore((current) => {
        const nextBest = Math.max(current, nextScore);
        if (nextBest > current) {
          audioRef.current?.playCheer();
        }
        saveBestSnakeScore(nextBest);
        return nextBest;
      });
      setScreen("game-over");
    },
    [stopLoop],
  );

  useEffect(() => {
    if (screen !== "playing") {
      stopLoop();
      return;
    }

    const loop = (timestamp: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp;
      }

      const delta = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;
      accumulatorRef.current += delta;

      setSession((current) => {
        let nextSession = current;
        while (accumulatorRef.current >= (boostActiveRef.current ? Math.max(30, nextSession.speedMs / 2) : nextSession.speedMs)) {
          const result = tickSnake(nextSession, settings, SNAKE_GRID_SIZE);
          nextSession = result.session;
          accumulatorRef.current -= boostActiveRef.current ? Math.max(30, nextSession.speedMs / 2) : nextSession.speedMs;

          if (result.ateFood) {
            audioRef.current?.playEat();
          }

          if (result.gameOver) {
            window.setTimeout(() => handleGameOver(nextSession.score), 0);
            break;
          }
        }
        return nextSession;
      });

      animationFrameRef.current = window.requestAnimationFrame(loop);
    };

    animationFrameRef.current = window.requestAnimationFrame(loop);
    return stopLoop;
  }, [handleGameOver, screen, settings, stopLoop]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && screen === "settings") {
        event.preventDefault();
        setScreen("menu");
        return;
      }

      if ((event.key === "p" || event.key === "P" || event.key === "Pause") && (screen === "playing" || screen === "paused")) {
        event.preventDefault();
        setScreen((current) => (current === "playing" ? "paused" : "playing"));
        return;
      }

      if (event.key === " " && screen === "playing") {
        event.preventDefault();
        boostActiveRef.current = true;
        return;
      }

      const directionMap: Record<string, SnakeDirection> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      const nextDirection = directionMap[event.key];
      if (!nextDirection) {
        return;
      }

      event.preventDefault();
      setSession((current) => {
        if (isOppositeDirection(current.direction, nextDirection)) {
          return current;
        }

        return queueDirection(current, nextDirection);
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === " ") {
        boostActiveRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [screen]);

  const startGame = useCallback(async () => {
    await audioRef.current?.unlock();
    boostActiveRef.current = false;
    setSession(createInitialSession(settings));
    setStatusMessage("");
    setScreen("playing");
  }, [settings]);

  const restartGame = useCallback(async () => {
    await startGame();
  }, [startGame]);

  const pauseGame = useCallback(() => {
    boostActiveRef.current = false;
    setScreen((current) => (current === "playing" ? "paused" : current));
  }, []);

  const resumeGame = useCallback(() => {
    setScreen((current) => (current === "paused" ? "playing" : current));
  }, []);

  const goToMenu = useCallback(() => {
    stopLoop();
    boostActiveRef.current = false;
    setScreen("menu");
  }, [stopLoop]);

  const openSettings = useCallback(() => {
    setScreen("settings");
  }, []);

  const closeSettings = useCallback(() => {
    setScreen("menu");
  }, []);

  const updateWallMode = useCallback((wallMode: WallMode) => {
    setSettings((current) => ({ ...current, wallMode }));
  }, []);

  const updateSettingsField = useCallback(<K extends keyof SnakeSettings>(field: K, value: SnakeSettings[K]) => {
    setSettings((current) => ({ ...current, [field]: value }));
  }, []);

  const setBoostActive = useCallback((active: boolean) => {
    boostActiveRef.current = active && screen === "playing";
  }, [screen]);

  const setDirection = useCallback((direction: SnakeDirection) => {
    setSession((current) => {
      if (isOppositeDirection(current.direction, direction)) {
        return current;
      }
      return queueDirection(current, direction);
    });
  }, []);

  const handleSwipe = useCallback(
    (startX: number, startY: number, endX: number, endY: number) => {
      const nextDirection = directionFromDelta(endX - startX, endY - startY, settings.swipeSensitivity);
      if (nextDirection) {
        setDirection(nextDirection);
      }
    },
    [setDirection, settings.swipeSensitivity],
  );

  const shareScore = useCallback(async (message: string) => {
    const score = Math.max(session.score, bestScore);
    const text = message.replace("{score}", String(score));
    const url = typeof window !== "undefined" ? `${window.location.origin}/snake` : "";

    try {
      if (navigator.share) {
        await navigator.share({ text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`.trim());
      }
      setStatusMessage(text);
    } catch {
      setStatusMessage(text);
    }
  }, [bestScore, session.score]);

  const score = session.score;

  return {
    settings,
    screen,
    session,
    score,
    bestScore,
    statusMessage,
    setStatusMessage,
    startGame,
    restartGame,
    pauseGame,
    resumeGame,
    goToMenu,
    openSettings,
    closeSettings,
    updateWallMode,
    updateSettingsField,
    setBoostActive,
    setDirection,
    handleSwipe,
    shareScore,
  };
}
