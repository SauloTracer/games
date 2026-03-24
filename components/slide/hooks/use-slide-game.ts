"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createOrderedBoard,
  createShuffledBoard,
  isSolvedBoard,
  moveTile,
} from "@/components/slide/game/engine";
import type { SlideRecord, SlideResult, SlideScreen, SlideSettings } from "@/components/slide/game/types";
import { SlideAudioController } from "@/components/slide/services/audio";
import {
  defaultSlideSettings,
  loadLastSlideResult,
  loadSlideRecords,
  loadSlideSettings,
  saveLastSlideResult,
  saveSlideRecords,
  saveSlideSettings,
} from "@/components/slide/services/storage";

function formatShareText(template: string, boardSize: number, elapsedSeconds: number, moves: number) {
  return template
    .replace("{size}", `${boardSize}x${boardSize}`)
    .replace("{time}", `${elapsedSeconds}s`)
    .replace("{moves}", String(moves));
}

export function useSlideGame() {
  const [settings, setSettings] = useState<SlideSettings>(defaultSlideSettings);
  const [screen, setScreen] = useState<SlideScreen>("menu");
  const [board, setBoard] = useState<number[]>(() => createOrderedBoard(defaultSlideSettings.boardSize));
  const [moves, setMoves] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [records, setRecords] = useState<Record<string, SlideRecord>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [lastResult, setLastResult] = useState<SlideResult | null>(null);
  const audioRef = useRef<SlideAudioController | null>(null);

  useEffect(() => {
    audioRef.current = new SlideAudioController();
    const loadedSettings = loadSlideSettings();
    setSettings(loadedSettings);
    setBoard(createOrderedBoard(loadedSettings.boardSize));
    setRecords(loadSlideRecords());
    setLastResult(loadLastSlideResult());
  }, []);

  useEffect(() => {
    saveSlideSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (screen !== "playing") {
      return;
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [screen]);

  const boardKey = `${settings.boardSize}x${settings.boardSize}`;
  const currentRecord = records[boardKey] ?? { bestTimeSeconds: null, bestMoves: null };

  const startGame = useCallback(async (size = settings.boardSize) => {
    await audioRef.current?.unlock();
    setBoard(createShuffledBoard(size));
    setMoves(0);
    setElapsedSeconds(0);
    setStatusMessage("");
    setScreen("playing");
  }, [settings.boardSize]);

  const restartGame = useCallback(async () => {
    await startGame(settings.boardSize);
  }, [settings.boardSize, startGame]);

  const goToMenu = useCallback(() => {
    setScreen("menu");
  }, []);

  const openSettings = useCallback(() => {
    setScreen("settings");
  }, []);

  const closeSettings = useCallback(() => {
    setScreen("menu");
  }, []);

  const updateSettingsField = useCallback(<K extends keyof SlideSettings>(field: K, value: SlideSettings[K]) => {
    setSettings((current) => ({ ...current, [field]: value }));
  }, []);

  const applyVictory = useCallback((nextMoves: number, nextElapsedSeconds: number, boardSize: number) => {
    const result: SlideResult = { boardSize, moves: nextMoves, elapsedSeconds: nextElapsedSeconds };
    setLastResult(result);
    saveLastSlideResult(result);
    setRecords((current) => {
      const key = `${boardSize}x${boardSize}`;
      const previous = current[key] ?? { bestTimeSeconds: null, bestMoves: null };
      const nextRecord: SlideRecord = {
        bestTimeSeconds:
          previous.bestTimeSeconds === null ? nextElapsedSeconds : Math.min(previous.bestTimeSeconds, nextElapsedSeconds),
        bestMoves: previous.bestMoves === null ? nextMoves : Math.min(previous.bestMoves, nextMoves),
      };
      const nextRecords = { ...current, [key]: nextRecord };
      saveSlideRecords(nextRecords);
      return nextRecords;
    });
    if (settings.soundEnabled) {
      audioRef.current?.playVictory();
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(100);
    }
    setScreen("victory");
  }, [settings.soundEnabled]);

  const move = useCallback((tileIndex: number) => {
    if (screen !== "playing") {
      return;
    }

    setBoard((current) => {
      const next = moveTile(current, settings.boardSize, tileIndex);
      if (!next) {
        return current;
      }

      const nextMoves = moves + 1;
      if (settings.soundEnabled) {
        audioRef.current?.playMove();
      }

      setMoves(nextMoves);
      if (isSolvedBoard(next)) {
        window.setTimeout(() => applyVictory(nextMoves, elapsedSeconds, settings.boardSize), 0);
      }
      return next;
    });
  }, [applyVictory, elapsedSeconds, moves, screen, settings.boardSize, settings.soundEnabled]);

  const shareResult = useCallback(async (template: string, copiedMessage: string) => {
    const base = lastResult ?? {
      boardSize: settings.boardSize,
      elapsedSeconds,
      moves,
    };
    const text = formatShareText(template, base.boardSize, base.elapsedSeconds, base.moves);
    const url = typeof window !== "undefined" ? `${window.location.origin}/slide` : "";

    try {
      if (navigator.share) {
        await navigator.share({ text, url });
        setStatusMessage(text);
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`.trim());
        setStatusMessage(copiedMessage);
      }
    } catch {
      setStatusMessage(copiedMessage);
    }
  }, [elapsedSeconds, lastResult, moves, settings.boardSize]);

  const boardRows = useMemo(() => {
    return Array.from({ length: settings.boardSize }, (_, row) =>
      board.slice(row * settings.boardSize, (row + 1) * settings.boardSize),
    );
  }, [board, settings.boardSize]);

  return {
    settings,
    screen,
    board,
    boardRows,
    moves,
    elapsedSeconds,
    currentRecord,
    statusMessage,
    startGame,
    restartGame,
    goToMenu,
    openSettings,
    closeSettings,
    updateSettingsField,
    move,
    shareResult,
    lastResult,
  };
}
