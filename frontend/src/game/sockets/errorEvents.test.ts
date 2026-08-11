import { ServerErrorEvents } from "@exploding-cats/contracts";
import { describe, expect, it } from "vitest";
import {
  GAME_ROOM_ERROR_EVENTS,
  GAME_SESSION_ERROR_EVENTS,
} from "./errorEvents";

describe("game socket error events", () => {
  it("contains every game-room action error", () => {
    expect(GAME_ROOM_ERROR_EVENTS).toEqual([
      ServerErrorEvents.DRAW_CARD_ERROR,
      ServerErrorEvents.PLAY_CARD_ERROR,
      ServerErrorEvents.PLAY_COMBO_ERROR,
      ServerErrorEvents.PLAY_DEFUSE_ERROR,
      ServerErrorEvents.INSERT_KITTEN_ERROR,
      ServerErrorEvents.PLAY_NOPE_ERROR,
      ServerErrorEvents.SELECT_PLAYER_ERROR,
      ServerErrorEvents.SEEN_THE_FUTURE_ERROR,
      ServerErrorEvents.CHOOSE_CARD_ID_ERROR,
      ServerErrorEvents.CHOOSE_CARD_INDEX_ERROR,
      ServerErrorEvents.CHOOSE_CARD_TYPE_ERROR,
    ]);
  });

  it("covers every server error event exactly once", () => {
    const handledEvents = [
      ServerErrorEvents.JOIN_GAME_ERROR,
      ...GAME_SESSION_ERROR_EVENTS,
      ...GAME_ROOM_ERROR_EVENTS,
    ];

    expect(new Set(handledEvents)).toEqual(
      new Set(Object.values(ServerErrorEvents)),
    );
    expect(handledEvents).toHaveLength(Object.values(ServerErrorEvents).length);
  });
});
