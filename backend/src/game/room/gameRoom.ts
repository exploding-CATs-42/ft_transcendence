import { Server } from "socket.io";
import { createActor } from "xstate";
import { gameMachine } from "../gameMachine";
import { createEmitters } from "./emitters";
import { drawCard, sendInitialState } from "./handlers";

interface RoomPlayer {
  playerId: string;
  displayName: string;
  socketId: string;
}

interface CreateGameRoomOptions {
  io: Server;
  gameId: string;
  players: RoomPlayer[];
  deckSize: number;
  cardsPerPlayer: number;
}

export const createGameRoom = (opts: CreateGameRoomOptions) => {
  const channel = `game:${opts.gameId}`;
  const socketByPlayer: Record<string, string> = {};

  for (const player of opts.players) {
    socketByPlayer[player.playerId] = player.socketId;
    opts.io.sockets.sockets.get(player.socketId)?.join(channel);
  }

  const emitters = createEmitters(opts.io, channel, socketByPlayer);

  const actorInput = {
    input: {
      players: opts.players.map((p) => ({
        playerId: p.playerId,
        displayName: p.displayName
      })),
      deckSize: opts.deckSize,
      cardsPerPlayer: opts.cardsPerPlayer
    }
  };

  const actor = createActor(gameMachine, actorInput);

  actor.start();

  const ops = { actor, emitters };

  sendInitialState({ actor, emitters });

  return {
    drawCard: (playerId: string) => drawCard(ops, playerId)
  };
};

export type GameRoom = ReturnType<typeof createGameRoom>;
