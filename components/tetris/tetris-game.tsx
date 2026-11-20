"use client";

import { useEffect, useRef } from "react";
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
  PrimaryButton,
} from "@/components/game-layout";
import { useLanguage } from "@/components/language-provider";
import { TetrisCanvas } from "@/components/tetris/components/tetris-canvas";
import { TetrisHud, TetrisQueue, TetrisRanking } from "@/components/tetris/components/tetris-hud";
import { TetrisMenu } from "@/components/tetris/components/tetris-menu";
import { TetrisSettingsPanel } from "@/components/tetris/components/tetris-settings-panel";
import { getPieceMatrix, TETROMINO_COLORS } from "@/components/tetris/game/tetrominos";
import type { TetrominoType } from "@/components/tetris/game/types";
import { useTetrisGame } from "@/components/tetris/hooks/use-tetris-game";

function CompactPiece({
  type,
}: {
  type: TetrominoType | null;
}) {
  if (!type) {
    return <div className="h-9 w-9 rounded-lg border border-dashed border-white/20 bg-white/5" />;
  }

  const matrix = getPieceMatrix(type);
  const cells: Array<{ row: number; column: number }> = [];
  matrix.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (cell) {
        cells.push({ row: rowIndex, column: columnIndex });
      }
    });
  });

  const minRow = Math.min(...cells.map((cell) => cell.row));
  const maxRow = Math.max(...cells.map((cell) => cell.row));
  const minColumn = Math.min(...cells.map((cell) => cell.column));
  const maxColumn = Math.max(...cells.map((cell) => cell.column));
  const width = maxColumn - minColumn + 1;
  const height = maxRow - minRow + 1;

  return (
    <div className="flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 p-1.5">
      <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}>
        {Array.from({ length: width * height }, (_, index) => {
          const row = Math.floor(index / width);
          const column = index % width;
          const filled = matrix[minRow + row]?.[minColumn + column] === 1;
          return (
            <span
              key={index}
              className="h-2.5 w-2.5 rounded-[0.2rem]"
              style={{
                background: filled ? TETROMINO_COLORS[type] : "rgba(255,255,255,0.04)",
                opacity: filled ? 1 : 0.25,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function TetrisGame() {
  const { t } = useLanguage();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchHoldTriggeredRef = useRef(false);
  const longPressTimerRef = useRef<number | null>(null);
  const {
    activeInstance,
    bestScore,
    ranking,
    screen,
    settings,
    statusMessage,
    closeSettings,
    goToMenu,
    hardDrop,
    hold,
    moveLeft,
    moveRight,
    openSettings,
    restartGame,
    rotate,
    shareResult,
    startGame,
    togglePause,
    updateSettingsField,
  } = useTetrisGame();

  const swipeThreshold = 28;
  const longPressMs = 240;

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) {
      touchStartRef.current = null;
      touchHoldTriggeredRef.current = false;
      return;
    }

    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchHoldTriggeredRef.current = false;

    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = window.setTimeout(() => {
      if (settings.holdEnabled && touchStartRef.current) {
        hold();
        touchHoldTriggeredRef.current = true;
        touchStartRef.current = null;
      }
    }, longPressMs);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 1) {
      event.preventDefault();
    }

    if (!touchStartRef.current || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    if (Math.abs(deltaX) >= swipeThreshold || Math.abs(deltaY) >= swipeThreshold) {
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (touchHoldTriggeredRef.current) {
      touchHoldTriggeredRef.current = false;
      return;
    }

    if (!touchStartRef.current) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) < swipeThreshold && Math.abs(deltaY) < swipeThreshold) {
      rotate();
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > swipeThreshold) {
        moveRight();
      } else if (deltaX < -swipeThreshold) {
        moveLeft();
      }
      return;
    }

    if (deltaY > swipeThreshold) {
      hardDrop();
      return;
    }

    if (deltaY < -swipeThreshold && settings.holdEnabled) {
      hold();
      return;
    }

    rotate();
  };

  const handleTouchCancel = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartRef.current = null;
    touchHoldTriggeredRef.current = false;
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const inGame = screen === "playing" || screen === "paused" || screen === "game-over";
  const mobilePreview =
    activeInstance && settings.showNextQueue ? activeInstance.board.nextQueue.slice(0, settings.previewCount) : [];

  return (
    <GamePage>
      <GameHeader ns="tetris" title={t("tetris.title")}>
        {inGame && activeInstance ? (
          <GameTag ns="tetris">
            {t("tetris.hud.level")} {activeInstance.board.level}
          </GameTag>
        ) : null}
      </GameHeader>

      <GameBody
        board={
          screen === "menu" ? (
            <TetrisMenu bestScore={bestScore} onPlay={() => void startGame()} onSettings={openSettings} />
          ) : screen === "settings" ? (
            <TetrisSettingsPanel settings={settings} onBack={closeSettings} onFieldChange={updateSettingsField} />
          ) : !activeInstance ? null : (
            <div className="flex w-full flex-col items-center gap-4">
              <div className="grid w-full max-w-[364px] gap-3 rounded-xl bg-ink p-3 text-white md:hidden">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={togglePause}
                    className="min-h-11 rounded-lg bg-white/10 px-4 text-xs font-bold text-white"
                  >
                    {screen === "paused" ? t("tetris.hud.resume") : t("tetris.hud.pause")}
                  </button>

                  <div className="rounded-lg bg-white/10 px-3 py-2 font-display text-lg font-extrabold tabular-nums">
                    {activeInstance.board.score}
                  </div>

                  {settings.holdEnabled ? (
                    <div className="flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-tetris-soft">{t("tetris.hud.hold")}</span>
                      <CompactPiece type={activeInstance.board.holdPiece} />
                    </div>
                  ) : null}
                </div>

                {mobilePreview.length ? (
                  <div className="flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-tetris-soft">{t("tetris.hud.nextPieces")}</span>
                    <div className="flex items-center gap-1">
                      {mobilePreview.map((type, index) => (
                        <CompactPiece key={`${type}-${index}`} type={type} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div
                className="relative w-full max-w-[364px]"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
                style={{ touchAction: "none" }}
              >
                <TetrisCanvas instance={activeInstance} settings={{ theme: settings.theme, showGhostPiece: settings.showGhostPiece }} />
              </div>

              {(screen === "paused" || screen === "game-over") && (
                <div className="w-full max-w-[520px] rounded-2xl border border-line bg-ground p-5 text-ink">
                  <h2 className="font-display text-2xl font-extrabold">
                    {screen === "paused" ? t("tetris.pause.title") : t("tetris.gameOver.title")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {screen === "paused"
                      ? t("tetris.pause.description")
                      : t("tetris.gameOver.description").replace("{score}", String(activeInstance.board.score))}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={screen === "paused" ? togglePause : () => void restartGame()}
                      className="min-h-11 rounded-xl bg-tetris px-5 font-bold text-ink transition hover:brightness-95"
                    >
                      {screen === "paused" ? t("tetris.pause.resume") : t("tetris.gameOver.retry")}
                    </button>
                    <button
                      type="button"
                      onClick={goToMenu}
                      className="min-h-11 rounded-xl border border-line-strong bg-surface px-5 font-semibold text-ink transition hover:bg-chip"
                    >
                      {t("tetris.game.menu")}
                    </button>
                    <button
                      type="button"
                      onClick={openSettings}
                      className="min-h-11 rounded-xl border border-line-strong bg-surface px-5 font-semibold text-ink transition hover:bg-chip"
                    >
                      {t("tetris.game.settings")}
                    </button>
                    {screen === "game-over" ? (
                      <button
                        type="button"
                        onClick={() => void shareResult(t("tetris.share.message"), t("tetris.share.copied"))}
                        className="min-h-11 rounded-xl border border-line-strong bg-surface px-5 font-semibold text-ink transition hover:bg-chip"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Share2 size={16} aria-hidden="true" />
                          {t("tetris.share.action")}
                        </span>
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )
        }
        panel={
          <>
            <PanelCard>
              <TetrisHud board={inGame && activeInstance ? activeInstance.board : null} bestScore={bestScore} />

              <ActionGrid cols={3}>
                <ActionButton
                  icon={screen === "paused" ? <Play size={20} /> : <Pause size={20} />}
                  label={screen === "paused" ? t("tetris.hud.resume") : t("tetris.hud.pause")}
                  onClick={togglePause}
                  disabled={screen !== "playing" && screen !== "paused"}
                />
                <ActionButton
                  icon={<Settings size={20} />}
                  label={t("tetris.layout.settings")}
                  title={t("tetris.game.settings")}
                  onClick={openSettings}
                  pressed={screen === "settings"}
                />
                <ActionButton
                  icon={<House size={20} />}
                  label={t("tetris.game.menu")}
                  onClick={goToMenu}
                  disabled={screen === "menu"}
                />
              </ActionGrid>

              <PrimaryButton onClick={() => void (inGame ? restartGame() : startGame())}>
                {t("tetris.layout.newGame")}
              </PrimaryButton>

              {statusMessage ? (
                <p className="text-sm font-semibold leading-6 text-tetris-ink" role="status">
                  {statusMessage}
                </p>
              ) : null}
            </PanelCard>

            {inGame && activeInstance && (settings.showNextQueue || settings.holdEnabled) ? (
              <PanelCard className="hidden md:flex">
                <TetrisQueue
                  board={activeInstance.board}
                  holdEnabled={settings.holdEnabled}
                  showNextQueue={settings.showNextQueue}
                  previewCount={settings.previewCount}
                />
              </PanelCard>
            ) : null}

            <PanelCard className="!gap-3">
              <TetrisRanking ranking={ranking} />
            </PanelCard>
          </>
        }
        below={
          <GameFooter ns="tetris" articleSlug="historia-do-tetris">
            <p className="text-[15px] leading-relaxed text-muted">{t("tetris.menu.goalBody")}</p>
            <HowToRow
              keys={
                <>
                  <KeyChip>← →</KeyChip>
                  <KeyChip>↑</KeyChip>
                  <KeyChip>↓</KeyChip>
                  <KeyChip>{t("tetris.layout.keySpace")}</KeyChip>
                  <KeyChip>C</KeyChip>
                  <KeyChip>P</KeyChip>
                </>
              }
              text={t("tetris.help.desktop")}
            />
            <HowToRow
              keys={
                <>
                  <KeyChip>{t("tetris.layout.keySwipe")}</KeyChip>
                  <KeyChip>{t("tetris.layout.keyTap")}</KeyChip>
                </>
              }
              text={t("tetris.help.mobile")}
            />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-ink">{t("tetris.game.strategyTitle")}</p>
              <ul className="grid gap-1.5 text-[15px] leading-relaxed text-muted">
                <li>{t("tetris.game.strategyHold")}</li>
                <li>{t("tetris.game.strategyPreview")}</li>
                <li>{t("tetris.game.strategyHardDrop")}</li>
                <li>{t("tetris.game.strategyTetris")}</li>
              </ul>
            </div>
          </GameFooter>
        }
      />
    </GamePage>
  );
}
