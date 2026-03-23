export type MultiplayerTransport = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendInput: (payload: { direction: string; timestamp: number }) => void;
};

export function createMultiplayerTransport(): MultiplayerTransport {
  return {
    async connect() {
      // Placeholder: the Snake module is prepared for a future websocket transport.
    },
    async disconnect() {
      // Placeholder: the Snake module is prepared for a future websocket transport.
    },
    sendInput() {
      // Placeholder: inputs will be forwarded to a websocket session in multiplayer mode.
    },
  };
}
