import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameOutEvents, GameStates } from "@exploding-cats/game-core";
import type { Game } from "./types";

const repositoryMocks = vi.hoisted(() => ({
  persistStartedGame: vi.fn(),
  persistFinishedGame: vi.fn(),
}));

vi.mock("./gameHistoryRepository", () => repositoryMocks);

import { attachGameHistoryPersistence } from "./gameHistoryPersistence";

type GameListener = (event: unknown) => void;

const createGame = (
  players: Array<{ id: string; isAlive: boolean }>,
  isGameOver = false,
) => {
  const listeners = new Map<string, GameListener>();
  const snapshot = {
    context: { players },
    matches: vi.fn((state: string) => {
      return state === GameStates.GAME_OVER && isGameOver;
    }),
  };
  const instance = {
    on: vi.fn((eventType: string, listener: GameListener) => {
      listeners.set(eventType, listener);
    }),
    getSnapshot: vi.fn(() => snapshot),
  };
  const game = {
    id: "4cce3d3e-3597-42b1-b251-61f803e3e18b",
    name: "Test game",
    maxPlayers: 4,
    createdAt: Date.parse("2026-07-31T10:00:00.000Z"),
    instance,
  } as unknown as Game;

  return { game, listeners };
};

describe("attachGameHistoryPersistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repositoryMocks.persistStartedGame.mockResolvedValue(undefined);
    repositoryMocks.persistFinishedGame.mockResolvedValue(undefined);
  });

  it("stores all starting players even when one leaves before game over", async () => {
    const { game, listeners } = createGame([{ id: "winner", isAlive: true }]);
    attachGameHistoryPersistence(game);

    listeners.get(GameOutEvents.GAME_STARTED)?.({
      players: [{ id: "leaver" }, { id: "winner" }],
    });
    listeners.get(GameOutEvents.GAME_OVER)?.({
      payload: { winner: { id: "winner" } },
    });

    await vi.waitFor(() => {
      expect(repositoryMocks.persistStartedGame).toHaveBeenCalledWith(game, [
        "leaver",
        "winner",
      ]);
      expect(repositoryMocks.persistFinishedGame).toHaveBeenCalledWith(
        game,
        "winner",
        ["winner"],
      );
    });
  });

  it("retries persistence for a restored game-over snapshot", async () => {
    const { game } = createGame(
      [
        { id: "loser", isAlive: false },
        { id: "winner", isAlive: true },
      ],
      true,
    );

    attachGameHistoryPersistence(game);

    await vi.waitFor(() => {
      expect(repositoryMocks.persistFinishedGame).toHaveBeenCalledWith(
        game,
        "winner",
        ["loser", "winner"],
      );
    });
  });
});
