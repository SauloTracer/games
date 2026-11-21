"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { getFoodPoints, SNAKE_GRID_SIZE } from "@/components/snake/game/engine";
import type { FoodType } from "@/components/snake/game/types";
import { SnakeHud } from "@/components/snake/components/snake-hud";
import { SnakeMenu } from "@/components/snake/components/snake-menu";
import { SnakeSettingsPanel } from "@/components/snake/components/snake-settings-panel";
import { useSnakeGame } from "@/components/snake/hooks/use-snake-game";
import { House, Pause, Play, Settings, Share2 } from "lucide-react";
import {
  ActionButton,
  ActionGrid,
  GameBody,
  GameFooter,
  GameHeader,
  GamePage,
  GameTag,
  HowToRow,
  KeyChip,
  PanelCard,
  PanelTitle,
  PrimaryButton,
} from "@/components/game-layout";

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
  // O tabuleiro só existe fora do menu/configurações; os efeitos abaixo rodam de novo quando ele aparece.
  const boardVisible = screen !== "menu" && screen !== "settings";

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
  }, [boardVisible]);

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
  }, [boardSize, boardVisible, session]);

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

  const inGame = boardVisible;

  return (
    <GamePage>
      <GameHeader ns="snake" title={t("snake.title")}>
        {inGame ? (
          <GameTag ns="snake">
            {t(`snake.food.${session.food.type}`)} +{getFoodPoints(session.food.type)}
          </GameTag>
        ) : null}
        <GameTag ns="snake" muted>
          {settings.wallMode === "wrap" ? t("snake.settings.wallWrap") : t("snake.settings.wallCollision")}
        </GameTag>
      </GameHeader>

      <GameBody
        board={
          screen === "menu" ? (
            <SnakeMenu
              subtitle={t("snake.menu.subtitle")}
              tagline={t("snake.menu.tagline")}
              playLabel={t("snake.menu.play")}
              settingsLabel={t("snake.menu.settings")}
              shareLabel={t("snake.menu.share")}
              onPlay={() => void startGame()}
              onSettings={openSettings}
              onShare={() => void shareScore(shareMessage, copiedMessage)}
              bestScoreLabel={bestScoreLabel}
            />
          ) : screen === "settings" ? (
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
          ) : (
            <div
              ref={boardRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
              className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl"
              style={{ touchAction: "none" }}
            >
              <canvas ref={canvasRef} className="max-w-full rounded-xl" />

              {screen === "paused" || screen === "game-over" ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-ink/50 p-4">
                  <div className="w-full max-w-sm rounded-[20px] bg-surface p-6 text-center shadow-card">
                    <h2 className="font-display text-2xl font-extrabold text-ink">{overlayTitle}</h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {screen === "paused" ? t("snake.pause.description") : t("snake.gameOver.description").replace("{score}", String(score))}
                    </p>
                    <div className="mt-6 grid gap-2">
                      {screen === "paused" ? (
                        <button
                          type="button"
                          onClick={resumeGame}
                          className="min-h-12 rounded-xl bg-snake px-4 py-3 font-semibold text-ink"
                        >
                          {t("snake.pause.resume")}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void shareScore(shareMessage, copiedMessage, false)}
                        className="min-h-11 rounded-xl border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Share2 size={16} aria-hidden="true" />
                          {t("snake.hud.share")}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void restartGame()}
                        className="min-h-12 rounded-xl bg-ink px-4 py-3 font-semibold text-white"
                      >
                        {t("snake.gameOver.retry")}
                      </button>
                      <button
                        type="button"
                        onClick={goToMenu}
                        className="min-h-12 rounded-xl bg-chip px-4 py-3 font-semibold text-ink"
                      >
                        {t("snake.gameOver.menu")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )
        }
        panel={
          <>
            <PanelCard>
              <SnakeHud
                scoreTitle={t("snake.layout.score")}
                bestTitle={t("snake.layout.best")}
                score={score}
                bestScore={bestScore}
              />

              <ActionGrid cols={2}>
                <ActionButton
                  icon={screen === "paused" ? <Play size={20} /> : <Pause size={20} />}
                  label={screen === "paused" ? t("snake.hud.resume") : t("snake.hud.pause")}
                  onClick={screen === "paused" ? resumeGame : pauseGame}
                  disabled={screen !== "playing" && screen !== "paused"}
                />
                <ActionButton
                  icon={<Settings size={20} />}
                  label={t("snake.menu.settings")}
                  onClick={openSettings}
                  pressed={screen === "settings"}
                />
                <ActionButton
                  icon={<Share2 size={20} />}
                  label={t("snake.hud.share")}
                  onClick={() => void shareScore(shareMessage, copiedMessage)}
                />
                <ActionButton
                  icon={<House size={20} />}
                  label={t("snake.layout.menu")}
                  onClick={goToMenu}
                  disabled={screen === "menu"}
                />
              </ActionGrid>

              <PrimaryButton onClick={() => void (inGame ? restartGame() : startGame())}>
                {t("snake.layout.newGame")}
              </PrimaryButton>

              {statusMessage ? (
                <p className="text-sm font-semibold leading-6 text-snake-ink" role="status">
                  {statusMessage}
                </p>
              ) : null}
            </PanelCard>

            <PanelCard className="!gap-3">
              <PanelTitle>{t("snake.food.title")}</PanelTitle>
              <div className="grid gap-2">
                {(["common", "rare", "special"] as const).map((type) => (
                  <div key={type} className="flex items-center justify-between rounded-xl bg-chip px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: foodPalette[type] }} />
                      <span className="text-sm font-semibold text-ink">{t(`snake.food.${type}`)}</span>
                    </div>
                    <span className="text-sm font-semibold text-muted">+{getFoodPoints(type)}</span>
                  </div>
                ))}
              </div>
            </PanelCard>
          </>
        }
        below={
          <GameFooter ns="snake" articleSlug="historia-do-snake">
            <HowToRow
              keys={
                <>
                  <KeyChip>↑ ↓ ← →</KeyChip>
                  <KeyChip>P</KeyChip>
                  <KeyChip>{t("snake.layout.keySpace")}</KeyChip>
                </>
              }
              text={t("snake.help.desktop")}
              device="pointer"
            />
            <HowToRow
              keys={
                <>
                  <KeyChip>{t("snake.layout.keySwipe")}</KeyChip>
                  <KeyChip>{t("snake.layout.keyHold")}</KeyChip>
                </>
              }
              text={t("snake.help.mobile")}
              device="touch"
            />
          </GameFooter>
        }
      />
    </GamePage>
  );
}
