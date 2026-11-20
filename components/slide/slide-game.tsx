"use client";

import { useMemo } from "react";
import { House, Mouse, Settings, Share2 } from "lucide-react";
import {
  ActionButton,
  ActionGrid,
  BodyPortal,
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

  const inGame = screen === "playing" || screen === "victory";

  return (
    <GamePage>
      <GameHeader ns="slide" title={t("slide.title")}>
        <GameTag ns="slide">{t("slide.hud.size").replace("{size}", `${settings.boardSize}x${settings.boardSize}`)}</GameTag>
        <GameTag ns="slide" muted>
          {settings.soundEnabled ? t("slide.settings.soundOn") : t("slide.settings.soundOff")}
        </GameTag>
      </GameHeader>

      <GameBody
        board={
          screen === "menu" ? (
            <SlideMenu
              subtitle={t("slide.menu.subtitle")}
              tagline={t("slide.menu.tagline")}
              playLabel={t("slide.menu.play")}
              settingsLabel={t("slide.menu.settings")}
              shareLabel={t("slide.menu.share")}
              bestTimeLabel={bestTimeLabel}
              bestMovesLabel={bestMovesLabel}
              onPlay={() => void startGame()}
              onSettings={openSettings}
              onShare={() => void shareResult(shareTemplate, copiedMessage)}
            />
          ) : screen === "settings" ? (
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
          ) : (
            <div className="w-full max-w-[600px] rounded-2xl bg-chip p-2 sm:p-3">
              <div
                data-slide-board
                className={`relative mx-auto aspect-square w-full ${boardWidthClass}`}
                style={{ touchAction: "manipulation" }}
              >
                <div
                  className="grid h-full w-full gap-1.5 sm:gap-2"
                  style={{ gridTemplateColumns: `repeat(${settings.boardSize}, minmax(0, 1fr))` }}
                >
                  {boardRows.flat().map((value, index) => (
                    <button
                      key={`${value}-${index}`}
                      type="button"
                      onClick={() => move(index)}
                      disabled={value === 0}
                      className={[
                        "flex aspect-square items-center justify-center text-center font-display font-extrabold text-ink",
                        settings.animationsEnabled ? "transition duration-200 ease-out" : "",
                        value === 0
                          ? "cursor-default rounded-xl border-2 border-dashed border-line-strong bg-transparent text-transparent"
                          : "rounded-xl border border-line bg-surface text-[clamp(1rem,3vw,2.2rem)] shadow-[0_2px_0_#D5DAE5] hover:-translate-y-0.5 hover:border-slide hover:bg-slide-soft active:translate-y-0",
                      ].join(" ")}
                    >
                      {value === 0 ? "0" : value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        }
        panel={
          <>
            <PanelCard>
              <SlideHud
                timeTitle={t("slide.layout.time")}
                movesTitle={t("slide.layout.moves")}
                time={formatTime(elapsedSeconds)}
                moves={moves}
              />

              <div className="flex flex-col gap-2 rounded-xl bg-chip p-3">
                <PanelTitle>{t("slide.records.title")}</PanelTitle>
                <p className="text-sm font-semibold text-ink">{bestTimeLabel}</p>
                <p className="text-sm font-semibold text-ink">{bestMovesLabel}</p>
              </div>

              <ActionGrid cols={3}>
                <ActionButton
                  icon={<Settings size={20} />}
                  label={t("slide.layout.settings")}
                  title={t("slide.menu.settings")}
                  onClick={openSettings}
                  pressed={screen === "settings"}
                />
                <ActionButton
                  icon={<Share2 size={20} />}
                  label={t("slide.layout.share")}
                  onClick={() => void shareResult(shareTemplate, copiedMessage)}
                  title={t("slide.menu.share")}
                />
                <ActionButton
                  icon={<House size={20} />}
                  label={t("slide.layout.menu")}
                  onClick={goToMenu}
                  disabled={screen === "menu"}
                />
              </ActionGrid>

              <PrimaryButton onClick={() => void (inGame ? restartGame() : startGame())}>
                {t("slide.layout.newGame")}
              </PrimaryButton>

              {statusMessage ? (
                <p className="text-sm font-semibold leading-6 text-slide-ink" role="status">
                  {statusMessage}
                </p>
              ) : null}
            </PanelCard>
          </>
        }
        below={
          <GameFooter ns="slide" articleSlug="historia-do-slide-puzzle">
            <HowToRow
              keys={
                <>
                  <KeyChip>
                    <Mouse size={14} aria-hidden="true" />
                    {t("slide.layout.keyClick")}
                  </KeyChip>
                  <KeyChip>{t("slide.layout.keyTap")}</KeyChip>
                </>
              }
              text={t("slide.help.line1")}
            />
            <HowToRow text={t("slide.help.line2")} />
          </GameFooter>
        }
      />

      {screen === "victory" ? (
        <BodyPortal>
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4">
            <div className="w-full max-w-md rounded-[20px] bg-surface p-6 shadow-card">
              <h2 className="text-center font-display text-2xl font-extrabold text-ink">{t("slide.victory.title")}</h2>
              <p className="mt-4 text-center text-sm leading-6 text-muted">
                {t("slide.victory.description")}
              </p>
              <div className="mt-6 grid gap-2 text-center">
                <div className="rounded-xl bg-chip px-4 py-3 font-semibold text-ink">
                  {t("slide.hud.time").replace("{value}", formatTime(lastResult?.elapsedSeconds ?? elapsedSeconds))}
                </div>
                <div className="rounded-xl bg-chip px-4 py-3 font-semibold text-ink">
                  {t("slide.hud.moves").replace("{value}", String(lastResult?.moves ?? moves))}
                </div>
              </div>
              <div className="mt-6 grid gap-2">
                <button type="button" onClick={() => void restartGame()} className="min-h-12 rounded-xl bg-ink px-4 py-3 font-semibold text-white">
                  {t("slide.victory.retry")}
                </button>
                <button type="button" onClick={goToMenu} className="min-h-12 rounded-xl bg-chip px-4 py-3 font-semibold text-ink">
                  {t("slide.victory.menu")}
                </button>
              </div>
            </div>
          </div>
        </BodyPortal>
      ) : null}
    </GamePage>
  );
}
