import type { Socket } from "socket.io";
import { AuthenticatedUser } from "./auth";

export interface SocketData {
  user: AuthenticatedUser;
}

// // Optional but recommended: type your events too
// export interface ClientToServerEvents {
//   // e.g. "message": (text: string) => void;
// }

// export interface ServerToClientEvents {
//   // e.g. "message": (text: string) => void;
// }

// export interface InterServerEvents {
//   // for inter-server communication if you scale horizontally
// }

// types/socket.ts
import type {
  ClientEvents,
  ServerPublicEvents,
  ServerPrivateEvents,
  ServerErrorEvents,
} from "./events";

export interface ClientToServerEvents {
  [ClientEvents.JOIN_GAME]: (gameId: string) => void;
  [ClientEvents.LEAVE_GAME]: () => void;
  [ClientEvents.CONFIRM_START]: () => void;
  [ClientEvents.CANCEL_START]: () => void;
}

export interface ServerToClientEvents {
  // Public events
  [ServerPublicEvents.PLAYER_JOINED]: (payload: PlayerJoinedPayload) => void;
  [ServerPublicEvents.PLAYER_LEFT]: (playerId: string) => void;
  [ServerPublicEvents.PLAYER_CONFIRMED]: (playerId: string) => void;
  [ServerPublicEvents.PLAYER_CANCELED]: (playerId: string) => void;
  [ServerPublicEvents.COUNTDOWN_STARTED]: (seconds: number) => void;
  [ServerPublicEvents.COUNTDOWN_CANCELED]: () => void;
  [ServerPublicEvents.GAME_STARTED]: () => void;
  [ServerPublicEvents.TURN_CHANGED]: (playerId: string) => void;
  [ServerPublicEvents.CARD_PLAYED]: (payload: CardPlayedPayload) => void;
  [ServerPublicEvents.COMBO_PLAYED]: (payload: unknown) => void; // TODO
  [ServerPublicEvents.NOPE_PLAYED]: (payload: unknown) => void; // TODO
  [ServerPublicEvents.NOPE_WINDOW_RESOLVED]: (payload: unknown) => void; // TODO
  [ServerPublicEvents.CARD_DRAWN]: (playerId: string) => void;
  [ServerPublicEvents.EXPLODING_KITTEN_DRAWN]: (playerId: string) => void;
  [ServerPublicEvents.PLAYER_DEFUSED]: (playerId: string) => void;
  [ServerPublicEvents.PLAYER_ELIMINATED]: (playerId: string) => void;
  [ServerPublicEvents.KITTEN_INSERTED]: (payload: unknown) => void; // TODO
  [ServerPublicEvents.FAVOR_REQUESTED]: (payload: unknown) => void; // TODO
  [ServerPublicEvents.FAVOR_RESOLVED]: (payload: unknown) => void; // TODO
  [ServerPublicEvents.DECK_SHUFFLED]: () => void;
  [ServerPublicEvents.GAME_OVER]: (winnerId: string) => void;

  // Private events (targeted emits to a single socket)
  [ServerPrivateEvents.LEFT_GAME]: () => void;
  [ServerPrivateEvents.WAITING_STATE]: (payload: unknown) => void; // TODO
  [ServerPrivateEvents.YOUR_HAND]: (cards: string[]) => void;
  [ServerPrivateEvents.CARD_RECEIVED]: (card: string) => void;
  [ServerPrivateEvents.CARD_REMOVED]: (card: string) => void;
  [ServerPrivateEvents.SEE_THE_FUTURE_PEEK]: (cards: string[]) => void;
  [ServerPrivateEvents.DEFUSE_PROMPT]: () => void;
  [ServerPrivateEvents.INSERT_KITTEN_PROMPT]: (deckSize: number) => void;
  [ServerPrivateEvents.FAVOR_MUST_GIVE]: (requesterId: string) => void;

  // Error events
  [ServerErrorEvents.JOIN_GAME_ERROR]: (payload: ErrorPayload) => void;
  [ServerErrorEvents.LEAVE_GAME_ERROR]: (payload: ErrorPayload) => void;
  [ServerErrorEvents.CONFIRM_START_ERROR]: (payload: ErrorPayload) => void;
  [ServerErrorEvents.CANCEL_START_ERROR]: (payload: ErrorPayload) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  user: {
    id: string;
  };
}

export type InterServerEvents = object;
export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
