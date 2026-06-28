import { GameAction, GameActionImplementation } from "./types";

export const GameActions = {} as const;

export default {} satisfies Record<GameAction, GameActionImplementation>;

/*
assign(({ context, event, spawn, self }) => {
                const player = spawn(playerMachine);

                subscribeToPlayerEvents(player, self);
                const players = new Map(context.players);
                players.set(event.player.id, player);

                return {
                  players,
                };
              }),
*/
