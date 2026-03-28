"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mouse, Search } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { getFoodPoints, SNAKE_GRID_SIZE } from "@/components/snake/game/engine";
import type { FoodType } from "@/components/snake/game/types";
import { SnakeHud } from "@/components/snake/components/snake-hud";
import { SnakeMenu } from "@/components/snake/components/snake-menu";
import { SnakeSettingsPanel } from "@/components/snake/components/snake-settings-panel";
import { useSnakeGame } from "@/components/snake/hooks/use-snake-game";
import { Share2 } from "lucide-react";

const foodPalette: Record<FoodType, string> = {
  common: "#22c55e",
  rare: "#f59e0b",
  special: "#ef4444",
};

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function ControlKey({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <span
      className={`inline-flex h-9 items-center justify-center rounded-xl border border-stone-300 bg-white px-3 text-xs font-bold text-stone-700 shadow-sm ${wide ? "min-w-[4.5rem]" : "min-w-9"
        }`}
    >
      {children}
    </span>
  );
}

function ControlRow({ visual, text }: { visual: React.ReactNode; text: string }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-emerald-200/80 bg-white/70 p-3 md:grid-cols-[auto_1fr] md:items-center">
      <div className="flex flex-wrap items-center gap-2">{visual}</div>
      <p className="max-w-[36rem] whitespace-normal break-words text-sm leading-6">{text}</p>
    </div>
  );
}

export function SnakeGame() {
  const { t } = useLanguage();
  const {
    settings,
    screen,
    session,
    score,
    bestScore,
    statusMessage,
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
    handleSwipe,
    shareScore,
  } = useSnakeGame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const [boardSize, setBoardSize] = useState(320);

  const scoreLabel = t("snake.hud.score").replace("{score}", String(score));
  const bestScoreLabel = t("snake.hud.bestScore").replace("{score}", String(bestScore));
  const shareMessage = t("snake.share.message");
  const copiedMessage = t("snake.share.copied");
  const overlayTitle = useMemo(() => {
    if (screen === "paused") {
      return t("snake.pause.title");
    }
    if (screen === "game-over") {
      return t("snake.gameOver.title");
    }
    return "";
  }, [screen, t]);

  useEffect(() => {
    const element = boardRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const nextSize = Math.max(260, Math.min(entry.contentRect.width, window.innerHeight * 0.62));
      setBoardSize(nextSize);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    canvas.width = boardSize * ratio;
    canvas.height = boardSize * ratio;
    canvas.style.width = `${boardSize}px`;
    canvas.style.height = `${boardSize}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const cellSize = boardSize / SNAKE_GRID_SIZE;
    context.clearRect(0, 0, boardSize, boardSize);
    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, boardSize, boardSize);

    context.strokeStyle = "rgba(255,255,255,0.05)";
    context.lineWidth = 1;
    for (let index = 0; index <= SNAKE_GRID_SIZE; index += 1) {
      const offset = index * cellSize;
      context.beginPath();
      context.moveTo(offset, 0);
      context.lineTo(offset, boardSize);
      context.stroke();
      context.beginPath();
      context.moveTo(0, offset);
      context.lineTo(boardSize, offset);
      context.stroke();
    }

    const food = session.food;
    context.fillStyle = foodPalette[food.type];
    context.beginPath();
    context.arc((food.x + 0.5) * cellSize, (food.y + 0.5) * cellSize, cellSize * 0.28, 0, Math.PI * 2);
    context.fill();

    session.snake.forEach((segment, index) => {
      const x = segment.x * cellSize + 2;
      const y = segment.y * cellSize + 2;
      const size = cellSize - 4;
      context.fillStyle = index === 0 ? "#86efac" : "#22c55e";
      roundedRect(context, x, y, size, size, Math.max(4, cellSize * 0.22));
      context.fill();
    });
  }, [boardSize, session]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
    if (screen === "playing") {
      longPressTimerRef.current = window.setTimeout(() => {
        setBoostActive(true);
      }, 220);
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setBoostActive(false);

    if (!swipeStartRef.current) {
      return;
    }

    const touch = event.changedTouches[0];
    handleSwipe(swipeStartRef.current.x, swipeStartRef.current.y, touch.clientX, touch.clientY);
    swipeStartRef.current = null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleTouchCancel = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    swipeStartRef.current = null;
    setBoostActive(false);
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  if (screen === "menu") {
    return (
      <SnakeMenu
        title={t("snake.title")}
        subtitle={t("snake.menu.subtitle")}
        playLabel={t("snake.menu.play")}
        settingsLabel={t("snake.menu.settings")}
        shareLabel={t("snake.menu.share")}
        onPlay={() => void startGame()}
        onSettings={openSettings}
        onShare={() => void shareScore(shareMessage, copiedMessage)}
        bestScoreLabel={bestScoreLabel}
        statusMessage={statusMessage}
      />
    );
  }

  if (screen === "settings") {
    return (
      <SnakeSettingsPanel
        title={t("snake.settings.title")}
        backLabel={t("snake.settings.back")}
        wallModeLabel={t("snake.settings.wallMode")}
        wrapLabel={t("snake.settings.wallWrap")}
        wrapTitle={t("snake.settings.wallWrapTitle")}
        collisionLabel={t("snake.settings.wallCollision")}
        swipeLabel={t("snake.settings.swipeSensitivity")}
        speedLabel={t("snake.settings.initialSpeed")}
        volumeLabel={t("snake.settings.volume")}
        muteLabel={t("snake.settings.mute")}
        settings={settings}
        onBack={closeSettings}
        onWallModeChange={updateWallMode}
        onFieldChange={updateSettingsField}
      />
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/90 p-4 shadow-panel backdrop-blur md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">{t("snake.title")}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
            {t(`snake.food.${session.food.type}`)} +{getFoodPoints(session.food.type)}
          </span>
          <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
            {settings.wallMode === "wrap" ? t("snake.settings.wallWrap") : t("snake.settings.wallCollision")}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <SnakeHud
            scoreLabel={scoreLabel}
            bestScoreLabel={bestScoreLabel}
            pauseLabel={t("snake.hud.pause")}
            pausedLabel={t("snake.hud.resume")}
            shareLabel={t("snake.hud.share")}
            onPause={screen === "paused" ? resumeGame : pauseGame}
            onShare={() => void shareScore(shareMessage, copiedMessage)}
            isPaused={screen === "paused"}
          />

          <div
            ref={boardRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[2rem] border border-emerald-200 bg-[radial-gradient(circle_at_top,#1f2937,#020617)] p-4 shadow-inner"
            style={{ touchAction: "none" }}
          >
            <canvas ref={canvasRef} className="max-w-full border border-white/10 shadow-2xl" />

            {screen === "paused" || screen === "game-over" ? (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-950/55 p-4">
                <div className="w-full max-w-sm rounded-[1.75rem] bg-white p-6 text-center shadow-panel">
                  <h2 className="text-2xl font-black text-stone-900">{overlayTitle}</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    {screen === "paused" ? t("snake.pause.description") : t("snake.gameOver.description").replace("{score}", String(score))}
                  </p>
                  <div className="mt-6 grid gap-2">
                    {screen === "paused" ? (
                      <button
                        type="button"
                        onClick={resumeGame}
                        className="rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white"
                      >
                        {t("snake.pause.resume")}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void shareScore(shareMessage, copiedMessage, false)}
                      className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Share2 size={16} />
                        {t("snake.hud.share")}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void restartGame()}
                      className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white"
                    >
                      {t("snake.gameOver.retry")}
                    </button>
                    <button
                      type="button"
                      onClick={goToMenu}
                      className="rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700"
                    >
                      {t("snake.gameOver.menu")}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            <p className="font-semibold">{t("sudoku.controlsTitle")}</p>
            <div className="mt-3 grid gap-3">
              <ControlRow
                visual={
                  <>
                    <div className="grid grid-cols-3 gap-1">
                      <span />
                      <ControlKey>↑</ControlKey>
                      <span />
                      <ControlKey>←</ControlKey>
                      <ControlKey>↓</ControlKey>
                      <ControlKey>→</ControlKey>
                    </div>
                    <ControlKey>P</ControlKey>
                    <ControlKey wide>Space</ControlKey>
                  </>
                }
                text={t("snake.help.desktop")}
              />
              <ControlRow
                visual={
                  <>
                    <ControlKey wide>Swipe</ControlKey>
                    <ControlKey wide>Hold</ControlKey>
                  </>
                }
                text={t("snake.help.mobile")}
              />
              <ControlRow
                visual={
                  <>
                    <ControlKey wide>{t("snake.hud.pause")}</ControlKey>
                    <ControlKey wide>{t("snake.hud.share")}</ControlKey>
                  </>
                }
                text={t("snake.quickActions.title")}
              />
            </div>
            {statusMessage ? <p className="mt-3 font-semibold text-emerald-700">{statusMessage}</p> : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">{t("snake.food.title")}</p>
            <div className="mt-4 grid gap-2">
              {(["common", "rare", "special"] as const).map((type) => (
                <div key={type} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: foodPalette[type] }} />
                    <span className="font-semibold text-stone-700">{t(`snake.food.${type}`)}</span>
                  </div>
                  <span className="text-sm font-semibold text-stone-500">+{getFoodPoints(type)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">{t("snake.quickActions.title")}</p>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={screen === "paused" ? resumeGame : pauseGame}
                className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700"
              >
                {screen === "paused" ? t("snake.hud.resume") : t("snake.hud.pause")}
              </button>
              <button
                type="button"
                onClick={openSettings}
                className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700"
              >
                {t("snake.menu.settings")}
              </button>
              <button
                type="button"
                onClick={() => void restartGame()}
                className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700"
              >
                {t("snake.gameOver.retry")}
              </button>
              <button
                type="button"
                onClick={goToMenu}
                className="rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white"
              >
                {t("snake.gameOver.menu")}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
