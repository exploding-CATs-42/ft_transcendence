// Project level
import { WaitingPlayerView } from "@exploding-cats/contracts";

export interface JoinGameResult {
  player: WaitingPlayerView;
  players: WaitingPlayerView[];
  isNewPlayer: boolean;
  countdownEndsAt: number | null;
}
