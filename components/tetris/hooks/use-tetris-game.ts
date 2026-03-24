"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { applyHold, hardDrop, movePiece, rotatePiece, softDrop, tickBoard } from "@/components/tetris/game/engine";
import type { GameInstance, MultiplayerRoomDraft, TetrisRankingEntry, TetrisScreen, TetrisSettings } from "@/components/tetris/game/types";
import { createLocalRoom } from "@/components/tetris/multiplayer/room";
import { TetrisAudioController } from "@/components/tetris/services/audio";
import {
  defaultTetrisSettings,
  loadTetrisHighScore,
  loadTetrisRanking,
  loadTetrisSettings,
  saveTetrisHighScore,
  saveTetrisResult,
  saveTetrisSettings,
} from "@/components/tetris/services/storage";

function getLocalBoard(instances: GameInstance[]) {
  return instances.find((instance) => instance.controlMode === "local") ?? instances[0];
}

export function useTetrisGame() {
  const [screen, setScreen] = useState<TetrisScreen>("menu");
  const [settings, setSettings] = useState<TetrisSettings>(defaultTetrisSettings);
  const [instances, setInstances] = useState<GameInstance[]>(() => createLocalRoom(defaultTetrisSettings).instances);
  const [roomDraft, setRoomDraft] = useState<MultiplayerRoomDraft>(() => createLocalRoom(defaultTetrisSettings).room);
  const [bestScore, setBestScore] = useState(0);
  const [ranking, setRanking] = useState<TetrisRankingEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const audioRef = useRef<TetrisAudioController | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const gameOverSavedRef = useRef(false);

  useEffect(() => {
    audioRef.current = new TetrisAudioController();
    const nextSettings = loadTetrisSettings();
    const room = createLocalRoom(nextSettings);
    setSettings(nextSettings);
    setInstances(room.instances);
    setRoomDraft(room.room);
    setBestScore(loadTetrisHighScore());
    setRanking(loadTetrisRanking());
  }, []);

  useEffect(() => {
    audioRef.current?.updateSettings(settings);
    saveTetrisSettings(settings);
  }, [settings]);

  const stopLoop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    lastTimestampRef.current = null;
  }, []);

  const saveResultIfNeeded = useCallback(
    (score: number, lines: number, level: number) => {
      if (gameOverSavedRef.current) {
        return;
      }
      gameOverSavedRef.current = true;
      setBestScore((current) => {
        const next = Math.max(current, score);
        saveTetrisHighScore(next);
        return next;
      });
      const entry = {
        score,
        lines,
        level,
        playedAt: new Date().toISOString(),
      };
      saveTetrisResult(entry);
      setRanking(loadTetrisRanking());
    },
    [],
  );

  useEffect(() => {
    if (screen !== "playing") {
      stopLoop();
      if (screen !== "paused") {
        audioRef.current?.stopMusic();
      }
      return;
    }

    const loop = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const deltaMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      setInstances((currentInstances) => {
        const nextInstances = currentInstances.map((instance) => {
          const previousBoard = instance.board;
          const tickResult = tickBoard(instance.board, settings, deltaMs);
          if (!previousBoard.clearingRows.length && tickResult.board.clearingRows.length) {
            audioRef.current?.playLineClear();
          }
          if (!previousBoard.gameOver && tickResult.board.gameOver) {
            audioRef.current?.playGameOver();
          }
          return {
            ...instance,
            board: tickResult.board,
          };
        });
        const localBoard = getLocalBoard(nextInstances)?.board;
        if (localBoard?.gameOver) {
          window.setTimeout(() => {
            audioRef.current?.stopMusic();
            saveResultIfNeeded(localBoard.score, localBoard.lines, localBoard.level);
            setScreen("game-over");
          }, 0);
        }
        return nextInstances;
      });

      animationFrameRef.current = window.requestAnimationFrame(loop);
    };

    animationFrameRef.current = window.requestAnimationFrame(loop);
    return stopLoop;
  }, [saveResultIfNeeded, screen, settings, stopLoop]);

  const updateLocalBoard = useCallback(
    (updater: (instance: GameInstance) => GameInstance) => {
      setInstances((currentInstances) => currentInstances.map((instance) => (instance.controlMode === "local" ? updater(instance) : instance)));
    },
    [],
  );

  const startGame = useCallback(async () => {
    gameOverSavedRef.current = false;
    await audioRef.current?.unlock();
    audioRef.current?.startMusic();
    const room = createLocalRoom(settings);
    setInstances(room.instances);
    setRoomDraft(room.room);
    setStatusMessage("");
    setScreen("playing");
  }, [settings]);

  const restartGame = useCallback(async () => {
    await startGame();
  }, [startGame]);

  const goToMenu = useCallback(() => {
    stopLoop();
    audioRef.current?.stopMusic();
    setScreen("menu");
  }, [stopLoop]);

  const openSettings = useCallback(() => {
    setScreen("settings");
  }, []);

  const closeSettings = useCallback(() => {
    setScreen("menu");
  }, []);

  const togglePause = useCallback(() => {
    setScreen((current) => {
      if (current === "playing") {
        audioRef.current?.stopMusic();
        return "paused";
      }
      if (current === "paused") {
        audioRef.current?.startMusic();
        return "playing";
      }
      return current;
    });
  }, []);

  const handleMultiplayerPlaceholder = useCallback(() => {
    setStatusMessage("Placeholder pronto: cada board já é uma instância separada para futura sincronização via WebSocket.");
  }, []);

  const updateSettingsField = useCallback(<K extends keyof TetrisSettings>(field: K, value: TetrisSettings[K]) => {
    setSettings((current) => ({ ...current, [field]: value }));
  }, []);

  const performSoftDrop = useCallback(() => {
    updateLocalBoard((instance) => {
      const result = softDrop(instance.board, settings);
      if (result.pieceLocked) {
        audioRef.current?.playDrop();
      }
      if (result.linesCleared) {
        audioRef.current?.playLineClear();
      }
      return { ...instance, board: result.board };
    });
  }, [settings, updateLocalBoard]);

  const performHardDrop = useCallback(() => {
    updateLocalBoard((instance) => {
      const result = hardDrop(instance.board, settings);
      audioRef.current?.playDrop();
      if (result.linesCleared) {
        audioRef.current?.playLineClear();
      }
      return { ...instance, board: result.board };
    });
  }, [settings, updateLocalBoard]);

  const performRotate = useCallback(() => {
    updateLocalBoard((instance) => {
      const nextBoard = rotatePiece(instance.board);
      if (nextBoard !== instance.board) {
        audioRef.current?.playRotate();
      }
      return { ...instance, board: nextBoard };
    });
  }, [updateLocalBoard]);

  const performMove = useCallback(
    (deltaX: number) => {
      updateLocalBoard((instance) => ({ ...instance, board: movePiece(instance.board, deltaX) }));
    },
    [updateLocalBoard],
  );

  const performHold = useCallback(() => {
    updateLocalBoard((instance) => ({ ...instance, board: applyHold(instance.board) }));
  }, [updateLocalBoard]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && screen === "settings") {
        event.preventDefault();
        setScreen("menu");
        return;
      }
      if (event.key === "p" || event.key === "P") {
        event.preventDefault();
        togglePause();
        return;
      }
      if (screen !== "playing") {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        performMove(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        performMove(1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        performSoftDrop();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        performRotate();
      } else if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        performHardDrop();
      } else if (event.key === "c" || event.key === "C" || event.key === "Shift") {
        event.preventDefault();
        performHold();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [performHardDrop, performHold, performMove, performRotate, performSoftDrop, screen, togglePause]);

  const activeInstance = getLocalBoard(instances);

  return {
    screen,
    settings,
    instances,
    roomDraft,
    activeInstance,
    bestScore,
    ranking,
    statusMessage,
    startGame,
    restartGame,
    goToMenu,
    openSettings,
    closeSettings,
    updateSettingsField,
    togglePause,
    handleMultiplayerPlaceholder,
    moveLeft: () => performMove(-1),
    moveRight: () => performMove(1),
    rotate: performRotate,
    softDrop: performSoftDrop,
    hardDrop: performHardDrop,
    hold: performHold,
  };
}
