"use client";

import { useRef } from "react";
import { Share2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { TetrisCanvas } from "@/components/tetris/components/tetris-canvas";
import { TetrisHud } from "@/components/tetris/components/tetris-hud";
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
    return <div className="h-9 w-9 rounded-xl border border-dashed border-white/20 bg-white/5" />;
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
    <div className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 p-1.5">
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

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) {
      touchStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 1) {
      event.preventDefault();
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
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
    touchStartRef.current = null;
  };

  if (screen === "menu") {
    return (
      <TetrisMenu
        bestScore={bestScore}
        onPlay={() => void startGame()}
        onSettings={openSettings}
      />
    );
  }

  if (screen === "settings") {
    return <TetrisSettingsPanel settings={settings} onBack={closeSettings} onFieldChange={updateSettingsField} />;
  }

  if (!activeInstance) {
    return null;
  }

  const mobilePreview = settings.showNextQueue ? activeInstance.board.nextQueue.slice(0, settings.previewCount) : [];

  return (
    <section
      className={`rounded-[2rem] border p-4 shadow-panel backdrop-blur md:p-6 ${settings.theme === "arcade-dark"
          ? "border-cyan-200/10 bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#0f172a_42%,#020617_100%)] text-white"
          : "border-amber-200/70 bg-[radial-gradient(circle_at_top,#fef3c7_0%,#fff7ed_48%,#fffbeb_100%)] text-stone-900"
        }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">{t("tetris.game.title")}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={goToMenu}
            className={`rounded-full px-4 py-3 text-sm font-bold transition ${settings.theme === "arcade-dark" ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-stone-800 hover:bg-stone-100"
              }`}
          >
            {t("tetris.game.menu")}
          </button>
          <button
            type="button"
            onClick={openSettings}
            className={`rounded-full px-4 py-3 text-sm font-bold transition ${settings.theme === "arcade-dark" ? "bg-cyan-400/15 text-cyan-50 hover:bg-cyan-400/25" : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
          >
            {t("tetris.game.settings")}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="grid gap-5">
          <div className="grid gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 p-3 text-white md:hidden">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={togglePause}
                className={`rounded-full px-4 py-2 text-xs font-bold ${settings.theme === "arcade-dark" ? "bg-slate-950/80 text-white" : "bg-white/90 text-stone-900"
                  }`}
              >
                {screen === "paused" ? t("tetris.hud.resume") : t("tetris.hud.pause")}
              </button>

              <div className="rounded-xl bg-white/8 px-3 py-2 text-lg font-black">{activeInstance.board.score}</div>

              {settings.holdEnabled ? (
                <div className="flex items-center gap-2 rounded-xl bg-white/8 px-2 py-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">{t("tetris.hud.hold")}</span>
                  <CompactPiece type={activeInstance.board.holdPiece} />
                </div>
              ) : null}
            </div>

            {mobilePreview.length ? (
              <div className="flex items-center gap-2 rounded-xl bg-white/8 px-2 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">{t("tetris.hud.nextPieces")}</span>
                <div className="flex items-center gap-1">
                  {mobilePreview.map((type, index) => (
                    <CompactPiece key={`${type}-${index}`} type={type} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_14rem]">
            <div
              className="relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
            >
              <TetrisCanvas instance={activeInstance} settings={{ theme: settings.theme, showGhostPiece: settings.showGhostPiece }} />
            </div>
            <div className="hidden gap-4 lg:grid">
              <div className={`rounded-[1.75rem] border p-4 ${settings.theme === "arcade-dark" ? "border-white/10 bg-black/25" : "border-amber-200 bg-white/80"}`}>
                <p className="text-sm font-bold">{t("tetris.game.controlsTitle")}</p>
                <div className="mt-3 grid gap-2 text-sm leading-6">
                  <p>{t("tetris.game.controlMove")}</p>
                  <p>{t("tetris.game.controlRotate")}</p>
                  <p>{t("tetris.game.controlHardDrop")}</p>
                  {settings.holdEnabled ? <p>{t("tetris.game.controlHold")}</p> : null}
                  <p>{t("tetris.game.controlPause")}</p>
                </div>
              </div>
              <div className={`rounded-[1.75rem] border p-4 ${settings.theme === "arcade-dark" ? "border-white/10 bg-black/25" : "border-amber-200 bg-white/80"}`}>
                <p className="text-sm font-bold">{t("tetris.game.strategyTitle")}</p>
                <div className="mt-3 grid gap-2 text-sm leading-6">
                  <p>{t("tetris.game.strategyHold")}</p>
                  <p>{t("tetris.game.strategyPreview")}</p>
                  <p>{t("tetris.game.strategyHardDrop")}</p>
                  <p>{t("tetris.game.strategyTetris")}</p>
                </div>
              </div>
            </div>
          </div>

          {(screen === "paused" || screen === "game-over") && (
            <div
              className={`rounded-[1.75rem] border p-5 ${settings.theme === "arcade-dark" ? "border-white/10 bg-black/30 text-white" : "border-amber-200 bg-white/90 text-stone-900"
                }`}
            >
              <h2 className="text-3xl font-black">{screen === "paused" ? t("tetris.pause.title") : t("tetris.gameOver.title")}</h2>
              <p className="mt-3 text-sm leading-6">
                {screen === "paused"
                  ? t("tetris.pause.description")
                  : t("tetris.gameOver.description").replace("{score}", String(activeInstance.board.score))}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={screen === "paused" ? togglePause : () => void restartGame()}
                  className={`rounded-full px-5 py-3 font-bold transition ${settings.theme === "arcade-dark" ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300" : "bg-amber-500 text-white hover:bg-amber-600"
                    }`}
                >
                  {screen === "paused" ? t("tetris.pause.resume") : t("tetris.gameOver.retry")}
                </button>
                <button
                  type="button"
                  onClick={goToMenu}
                  className={`rounded-full px-5 py-3 font-bold transition ${settings.theme === "arcade-dark" ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-stone-800 hover:bg-stone-100"
                    }`}
                >
                  {t("tetris.game.menu")}
                </button>
                <button
                  type="button"
                  onClick={openSettings}
                  className={`rounded-full px-5 py-3 font-bold transition ${settings.theme === "arcade-dark" ? "bg-fuchsia-500/15 text-fuchsia-100 hover:bg-fuchsia-500/25" : "bg-stone-900 text-white hover:bg-stone-800"
                    }`}
                >
                  {t("tetris.game.settings")}
                </button>
                {screen === "game-over" ? (
                  <button
                    type="button"
                    onClick={() => void shareResult(t("tetris.share.message"), t("tetris.share.copied"))}
                    className={`rounded-full px-5 py-3 font-bold transition ${settings.theme === "arcade-dark" ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-stone-800 hover:bg-stone-100"
                      }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Share2 size={16} />
                      {t("tetris.share.action")}
                    </span>
                  </button>
                ) : null}
              </div>
              {statusMessage ? <p className="mt-4 text-sm font-semibold text-cyan-200">{statusMessage}</p> : null}
            </div>
          )}
        </div>

        <TetrisHud
          board={activeInstance.board}
          bestScore={bestScore}
          ranking={ranking}
          paused={screen === "paused"}
          onPauseToggle={togglePause}
          holdEnabled={settings.holdEnabled}
          showNextQueue={settings.showNextQueue}
          previewCount={settings.previewCount}
        />
      </div>
    </section>
  );
}
