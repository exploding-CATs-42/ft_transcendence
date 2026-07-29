import { GAME_MACHINE_ID } from "./constants";
import { GameStates } from "./states";

const getStatePath = (...subPath: string[]) => {
  const path = `#${[GAME_MACHINE_ID, ...subPath].join(".")}`;

  return path;
};

export const GameTargets = {
  WAITING: getStatePath(GameStates.WAITING),
  WAITING_CONFIRMING: getStatePath(
    GameStates.WAITING,
    GameStates.WAITING_CONFIRMING,
  ),
  WAITING_STARTING: getStatePath(
    GameStates.WAITING,
    GameStates.WAITING_STARTING,
  ),
  PLAYING: getStatePath(GameStates.PLAYING),
  CHANGING_TURN: getStatePath(GameStates.PLAYING, GameStates.CHANGING_TURN),
  WAITING_FOR_PLAYER_ACTIONS: getStatePath(
    GameStates.PLAYING,
    GameStates.WAITING_FOR_PLAYER_ACTIONS,
  ),
  CHECKING_DRAWN_CARD: getStatePath(
    GameStates.PLAYING,
    GameStates.CHECKING_DRAWN_CARD,
  ),
  EXPLODING_KITTEN_DRAWN: getStatePath(
    GameStates.PLAYING,
    GameStates.EXPLODING_KITTEN_DRAWN,
  ),
  WAITING_FOR_DEFUSE_CARD: getStatePath(
    GameStates.PLAYING,
    GameStates.WAITING_FOR_DEFUSE_CARD,
  ),
  WAITING_FOR_KITTEN_INSERTION: getStatePath(
    GameStates.PLAYING,
    GameStates.WAITING_FOR_KITTEN_INSERTION,
  ),
  EXPLODING_PLAYER: getStatePath(
    GameStates.PLAYING,
    GameStates.EXPLODING_PLAYER,
  ),
  GAME_OVER: getStatePath(GameStates.GAME_OVER),
  CHECKING_REMAINING_TURNS: getStatePath(
    GameStates.PLAYING,
    GameStates.CHECKING_REMAINING_TURNS,
  ),
  WAITING_FOR_NOPES: getStatePath(
    GameStates.PLAYING,
    GameStates.WAITING_FOR_NOPES,
  ),
  RESOLVING_NOPES: getStatePath(GameStates.PLAYING, GameStates.RESOLVING_NOPES),
  SELECTING_PLAYER: getStatePath(
    GameStates.PLAYING,
    GameStates.SELECTING_PLAYER,
  ),
  WAITING_FOR_FAVOR_CARD_SELECTION: getStatePath(
    GameStates.PLAYING,
    GameStates.WAITING_FOR_FAVOR_CARD_SELECTION,
  ),
} as const satisfies Record<keyof typeof GameStates, string>;
