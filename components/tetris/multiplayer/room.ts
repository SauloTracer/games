import { createPlayerBoard } from "@/components/tetris/game/engine";
import type { GameInstance, MultiplayerRoomDraft, TetrisSettings } from "@/components/tetris/game/types";

export function createLocalRoom(settings: TetrisSettings): { instances: GameInstance[]; room: MultiplayerRoomDraft } {
  const localId = "local-player";
  return {
    instances: [
      {
        id: localId,
        controlMode: "local",
        board: createPlayerBoard("Jogador 1", settings, localId),
      },
    ],
    room: {
      roomId: null,
      players: [{ id: localId, name: "Jogador 1", connected: true }],
      garbageQueueEnabled: true,
    },
  };
}

