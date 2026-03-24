"use client";

import { useMemo } from "react";
import { Share2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { SlideHud } from "@/components/slide/components/slide-hud";
import { SlideMenu } from "@/components/slide/components/slide-menu";
import { SlideSettingsPanel } from "@/components/slide/components/slide-settings-panel";
import { useSlideGame } from "@/components/slide/hooks/use-slide-game";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function SlideGame() {
  const { t } = useLanguage();
  const {
    settings,
    screen,
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
  } = useSlideGame();

  const shareTemplate = t("slide.share.message");
  const copiedMessage = t("slide.share.copied");
  const bestTimeLabel = t("slide.menu.bestTime").replace(
    "{value}",
    currentRecord.bestTimeSeconds === null ? t("slide.records.none") : formatTime(currentRecord.bestTimeSeconds),
  );
  const bestMovesLabel = t("slide.menu.bestMoves").replace(
    "{value}",
    currentRecord.bestMoves === null ? t("slide.records.none") : String(currentRecord.bestMoves),
  );

  const boardWidthClass = useMemo(() => {
    if (settings.boardSize <= 5) {
      return "max-w-[34rem]";
    }
    if (settings.boardSize <= 7) {
      return "max-w-[38rem]";
    }
    return "max-w-[42rem]";
  }, [settings.boardSize]);

  if (screen === "menu") {
    return (
      <SlideMenu
        title={t("slide.title")}
        subtitle={t("slide.menu.subtitle")}
        playLabel={t("slide.menu.play")}
        settingsLabel={t("slide.menu.settings")}
        shareLabel={t("slide.menu.share")}
        bestTimeLabel={bestTimeLabel}
        bestMovesLabel={bestMovesLabel}
        onPlay={() => void startGame()}
        onSettings={openSettings}
        onShare={() => void shareResult(shareTemplate, copiedMessage)}
        statusMessage={statusMessage}
      />
    );
  }

  if (screen === "settings") {
    return (
      <SlideSettingsPanel
        title={t("slide.settings.title")}
        backLabel={t("slide.settings.back")}
        boardSizeLabel={t("slide.settings.boardSize")}
        soundLabel={t("slide.settings.sound")}
        animationsLabel={t("slide.settings.animations")}
        settings={settings}
        onBack={closeSettings}
        onFieldChange={updateSettingsField}
      />
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/90 p-4 shadow-panel backdrop-blur md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">{t("slide.title")}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-800">
            {t("slide.hud.size").replace("{size}", `${settings.boardSize}x${settings.boardSize}`)}
          </span>
          <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
            {settings.soundEnabled ? t("slide.settings.soundOn") : t("slide.settings.soundOff")}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <SlideHud
            timeLabel={t("slide.hud.time").replace("{value}", formatTime(elapsedSeconds))}
            movesLabel={t("slide.hud.moves").replace("{value}", String(moves))}
            restartLabel={t("slide.hud.restart")}
            onRestart={() => void restartGame()}
          />

          <div className="rounded-[2rem] border border-rose-200 bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 p-4 shadow-inner md:p-6">
            <div className="mx-auto max-w-[42rem] rounded-[1.5rem] bg-[#fff7ed] p-4 shadow-lg">
              <div
                className={`relative mx-auto aspect-square w-full ${boardWidthClass}`}
                style={{ touchAction: "manipulation" }}
              >
                <div
                  className="grid h-full w-full gap-2"
                  style={{ gridTemplateColumns: `repeat(${settings.boardSize}, minmax(0, 1fr))` }}
                >
                  {boardRows.flat().map((value, index) => (
                    <button
                      key={`${value}-${index}`}
                      type="button"
                      onClick={() => move(index)}
                      disabled={value === 0}
                      className={[
                        "flex aspect-square items-center justify-center border-2 text-center font-black text-stone-900 shadow-sm",
                        settings.animationsEnabled ? "transition duration-200 ease-out" : "",
                        value === 0
                          ? "cursor-default rounded-[1.25rem] border-dashed border-yellow-200 bg-yellow-100/80 text-transparent shadow-inner"
                          : "rounded-[1.1rem] border-stone-200 bg-white text-[clamp(1rem,3vw,2.4rem)] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
                      ].join(" ")}
                    >
                      {value === 0 ? "0" : value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 text-center text-sm font-semibold uppercase tracking-[0.3em] text-stone-700">
                Racha-Cuca
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
            <p>{t("slide.help.line1")}</p>
            <p className="mt-2">{t("slide.help.line2")}</p>
            {statusMessage ? <p className="mt-3 font-semibold text-rose-700">{statusMessage}</p> : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">{t("slide.records.title")}</p>
            <div className="mt-4 grid gap-2">
              <div className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">{bestTimeLabel}</div>
              <div className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">{bestMovesLabel}</div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">{t("slide.quickActions.title")}</p>
            <div className="mt-4 grid gap-2">
              <button type="button" onClick={openSettings} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                {t("slide.menu.settings")}
              </button>
              <button type="button" onClick={() => void shareResult(shareTemplate, copiedMessage)} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                <span className="inline-flex items-center gap-2">
                  <Share2 size={18} />
                  {t("slide.menu.share")}
                </span>
              </button>
              <button type="button" onClick={goToMenu} className="rounded-2xl bg-rose-600 px-4 py-3 font-semibold text-white">
                {t("slide.victory.menu")}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {screen === "victory" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-panel">
            <h2 className="text-center text-2xl font-black text-stone-900">{t("slide.victory.title")}</h2>
            <p className="mt-4 text-center text-sm leading-6 text-stone-600">
              {t("slide.victory.description")}
            </p>
            <div className="mt-6 grid gap-2 text-center">
              <div className="rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700">
                {t("slide.hud.time").replace("{value}", formatTime(lastResult?.elapsedSeconds ?? elapsedSeconds))}
              </div>
              <div className="rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700">
                {t("slide.hud.moves").replace("{value}", String(lastResult?.moves ?? moves))}
              </div>
            </div>
            <div className="mt-6 grid gap-2">
              <button type="button" onClick={() => void restartGame()} className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white">
                {t("slide.victory.retry")}
              </button>
              <button type="button" onClick={goToMenu} className="rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700">
                {t("slide.victory.menu")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
